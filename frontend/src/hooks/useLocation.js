import { useState, useEffect, useRef } from 'react'

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [enabled, setEnabled] = useState(true)
  const watchId = useRef(null)

  useEffect(() => {
    if (!enabled) return

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setError(null)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied. Enable GPS in browser settings.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Check your GPS.')
            break
          case err.TIMEOUT:
            setError('Location request timed out.')
            break
          default:
            setError('Could not get location.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current)
      }
    }
  }, [enabled])

  return { location, error, setEnabled }
}
