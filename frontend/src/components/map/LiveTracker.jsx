import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useLocation } from '../../hooks/useLocation'
import RouteMap from './RouteMap'

export default function LiveTracker({ ride }) {
  const { user } = useAuth()
  const [driverLoc, setDriverLoc] = useState(null)
  const isDriver = ride?.owner_id === user?.id
  const { location, error: locError, setEnabled } = useLocation()

  // Driver: upload location every 5s when in_progress
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

  // Rider: poll driver location every 3s when in_progress
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

  // Load last known location on mount
  useEffect(() => {
    if (ride?.driver_lat && ride?.driver_lng) {
      setDriverLoc({ lat: ride.driver_lat, lng: ride.driver_lng })
    }
  }, [ride?.driver_lat, ride?.driver_lng])

  if (ride?.status !== 'in_progress') {
    return (
      <div className="tracker-placeholder">
        <p>Tracking will appear here once the ride starts.</p>
      </div>
    )
  }

  if (isDriver && locError) {
    return (
      <div className="tracker-error">
        <p>{locError}</p>
        <button className="btn-secondary" onClick={() => setEnabled(true)}>Retry GPS</button>
      </div>
    )
  }

  const fromPt = ride ? { lat: ride.from_lat, lng: ride.from_lng, city: ride.from_city } : null
  const toPt = ride ? { lat: ride.to_lat, lng: ride.to_lng, city: ride.to_city } : null

  return (
    <div className="live-tracker">
      <RouteMap from={fromPt} to={toPt} driverLocation={driverLoc} />
      {driverLoc && (
        <p className="tracker-status">
          {isDriver ? 'Your location is being shared' : 'Driver location updated live'}
        </p>
      )}
    </div>
  )
}
