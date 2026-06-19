import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useLocation } from '../../hooks/useLocation'
import { calculateRoute } from '../../lib/tomtom'
import RouteMap from './RouteMap'

export default function LiveTracker({ ride }) {
  const { user } = useAuth()
  const [driverLoc, setDriverLoc] = useState(null)
  const [eta, setEta] = useState(null)
  const isDriver = ride?.owner_id === user?.id
  const { location, error: locError, setEnabled } = useLocation()
  const lastUpdateRef = useRef(Date.now())
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    if (!isDriver || ride?.status !== 'in_progress' || !location) return

    const interval = setInterval(async () => {
      try {
        await api.patch(`/api/rides/${ride.id}/location?lat=${location.lat}&lng=${location.lng}`)
        lastUpdateRef.current = Date.now()
      } catch {
        // silent
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isDriver, ride?.id, ride?.status, location])

  useEffect(() => {
    if (isDriver || ride?.status !== 'in_progress') return

    const poll = async () => {
      try {
        const data = await api.get(`/api/rides/${ride.id}`)
        if (data.driver_lat && data.driver_lng) {
          const loc = { lat: data.driver_lat, lng: data.driver_lng }
          setDriverLoc(loc)
          lastUpdateRef.current = Date.now()
        }
      } catch {
        // silent
      }
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [isDriver, ride?.id, ride?.status])

  useEffect(() => {
    if (ride?.driver_lat && ride?.driver_lng) {
      const loc = { lat: ride.driver_lat, lng: ride.driver_lng }
      setDriverLoc(loc)
      lastUpdateRef.current = Date.now()
    }
  }, [ride?.driver_lat, ride?.driver_lng])

  useEffect(() => {
    if (!driverLoc || !ride?.to_lat || !ride?.to_lng) return

    let cancelled = false
    const fetchEta = async () => {
      try {
        const route = await calculateRoute(driverLoc.lat, driverLoc.lng, ride.to_lat, ride.to_lng)
        if (!cancelled) setEta(route)
      } catch {
        // silent
      }
    }
    fetchEta()
    const interval = setInterval(fetchEta, 15000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [driverLoc?.lat, driverLoc?.lng, ride?.to_lat, ride?.to_lng])

  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdateRef.current) / 1000))
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  const formatEta = (seconds) => {
    const mins = Math.round(seconds / 60)
    if (mins < 1) return 'Less than a minute'
    if (mins === 1) return '1 minute'
    return `${mins} minutes`
  }

  if (ride?.status !== 'in_progress') {
    return (
      <motion.div
        className="tracker-placeholder"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p>Tracking will appear here once the ride starts.</p>
      </motion.div>
    )
  }

  if (isDriver && locError) {
    return (
      <motion.div
        className="tracker-error"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p>{locError}</p>
        <motion.button
          className="btn-secondary"
          onClick={() => setEnabled(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Retry GPS
        </motion.button>
      </motion.div>
    )
  }

  const fromPt = ride ? { lat: ride.from_lat, lng: ride.from_lng, city: ride.from_city } : null
  const toPt = ride ? { lat: ride.to_lat, lng: ride.to_lng, city: ride.to_city } : null

  const trafficDelay = eta ? eta.trafficDurationSeconds - eta.durationSeconds : 0

  return (
    <motion.div
      className="live-tracker"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <RouteMap from={fromPt} to={toPt} driverLocation={driverLoc} />
      {driverLoc && (
        <motion.div
          className="tracker-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p>
            <span className="tracker-dot" />
            {isDriver ? 'Your location is being shared' : 'Driver location updated live'}
          </p>
          {eta && (
            <p className="tracker-eta" style={{ fontSize: '0.85rem', marginTop: 4 }}>
              {formatEta(eta.trafficDurationSeconds)} away
              {trafficDelay > 60 ? <span style={{ color: 'var(--error)', marginLeft: 4 }}>(traffic: +{formatEta(trafficDelay)})</span> : null}
            </p>
          )}
          <p className="tracker-staleness" style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 2 }}>
            Updated {secondsAgo}s ago
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
