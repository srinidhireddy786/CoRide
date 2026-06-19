import { useEffect, useRef } from 'react'
import tt from '@tomtom-international/web-sdk-maps'
import { motion } from 'framer-motion'
import { HYDERABAD_CENTER } from '../../lib/hyderabad'

const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY

export default function RouteMap({ from, to, driverLocation, height = '300px' }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const driverMarkerRef = useRef(null)

  useEffect(() => {
    if (!mapEl.current) return
    const map = tt.map({
      key: API_KEY,
      container: mapEl.current,
      center: [HYDERABAD_CENTER[1], HYDERABAD_CENTER[0]],
      zoom: 12,
      scrollZoom: true,
      dragPan: true,
    })
    mapRef.current = map

    map.on('load', () => {
      const hasCoords = from?.lat && from?.lng && to?.lat && to?.lng
      if (hasCoords) {
        const m1 = new tt.Marker().setLngLat([from.lng, from.lat]).addTo(map)
        const m2 = new tt.Marker().setLngLat([to.lng, to.lat]).addTo(map)
        markersRef.current = [m1, m2]

        const bounds = new tt.LngLatBounds()
        bounds.extend([from.lng, from.lat])
        bounds.extend([to.lng, to.lat])
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      }
    })

    return () => { map.remove() }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (from?.lat && from?.lng && to?.lat && to?.lng) {
      const m1 = new tt.Marker().setLngLat([from.lng, from.lat]).addTo(mapRef.current)
      const m2 = new tt.Marker().setLngLat([to.lng, to.lat]).addTo(mapRef.current)
      markersRef.current = [m1, m2]

      const bounds = new tt.LngLatBounds()
      bounds.extend([from.lng, from.lat])
      bounds.extend([to.lng, to.lat])
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14 })
    }
  }, [from?.lat, from?.lng, to?.lat, to?.lng])

  useEffect(() => {
    if (!mapRef.current) return
    if (driverLocation) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLngLat([driverLocation.lng, driverLocation.lat])
      } else {
        const el = document.createElement('div')
        el.style.width = '16px'
        el.style.height = '16px'
        el.style.background = '#4f46e5'
        el.style.borderRadius = '50%'
        el.style.border = '3px solid white'
        el.style.boxShadow = '0 0 8px rgba(79,70,229,0.6)'
        const marker = new tt.Marker({ element: el })
          .setLngLat([driverLocation.lng, driverLocation.lat])
          .addTo(mapRef.current)
        driverMarkerRef.current = marker
      }
    }
  }, [driverLocation?.lat, driverLocation?.lng])

  return (
    <motion.div
      style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div ref={mapEl} style={{ height: '100%', width: '100%' }} />
    </motion.div>
  )
}
