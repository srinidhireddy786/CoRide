import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useLocation } from '../../hooks/useLocation'
import RouteMap from './RouteMap'

export default function LiveTracker({ ride }) {
  const { user } = useAuth()
  const [driverLoc, setDriverLoc] = useState(null)
  const isDriver = ride?.owner_id === user?.id
  const { location, error: locError, setEnabled } = useLocation()

  useEffect(() => {
    if (!isDriver || ride?.status !== 'in_progress' || !location) return

    const interval = setInterval(async () => {
      try {
        await api.patch(`/api/rides/${ride.id}/location?lat=${location.lat}&lng=${location.lng}`)
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
          setDriverLoc({ lat: data.driver_lat, lng: data.driver_lng })
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
      setDriverLoc({ lat: ride.driver_lat, lng: ride.driver_lng })
    }
  }, [ride?.driver_lat, ride?.driver_lng])

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

  return (
    <motion.div
      className="live-tracker"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <RouteMap from={fromPt} to={toPt} driverLocation={driverLoc} />
      {driverLoc && (
        <motion.p
          className="tracker-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="tracker-dot" />
          {isDriver ? 'Your location is being shared' : 'Driver location updated live'}
        </motion.p>
      )}
    </motion.div>
  )
}
