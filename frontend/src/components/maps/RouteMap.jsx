import { useEffect, useRef } from 'react'
import tt from '@tomtom-international/web-sdk-maps'
import { motion } from 'framer-motion'
import { calculateRoute } from '../../lib/tomtom'

const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY

export default function RouteMap({ from, to, height = 300, className = '' }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!from || !to || !mapEl.current) return

    const map = tt.map({
      key: API_KEY,
      container: mapEl.current,
      center: [(from.lng + to.lng) / 2, (from.lat + to.lat) / 2],
      zoom: 13,
      scrollZoom: false,
      dragPan: true,
    })

    mapRef.current = map

    map.on('load', async () => {
      new tt.Marker().setLngLat([from.lng, from.lat]).addTo(map)
      new tt.Marker().setLngLat([to.lng, to.lat]).addTo(map)

      try {
        const route = await calculateRoute(from.lat, from.lng, to.lat, to.lng)
        const coords = route.routeGeometry.map(p => [p.lon, p.lat])

        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            },
          },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#008080', 'line-width': 4, 'line-opacity': 0.8 },
        })

        const bounds = new tt.LngLatBounds()
        coords.forEach((c) => bounds.extend(c))
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      } catch {
        const bounds = new tt.LngLatBounds()
        bounds.extend([from.lng, from.lat])
        bounds.extend([to.lng, to.lat])
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      }
    })

    return () => { map.remove() }
  }, [from?.lat, from?.lng, to?.lat, to?.lng])

  if (!from || !to) {
    return (
      <div
        className={`route-map-fallback ${className}`}
        style={{ height, background: 'var(--surface-variant)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}
      >
        Map unavailable
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div ref={mapEl} style={{ height, borderRadius: 12, overflow: 'hidden' }} className={className} />
    </motion.div>
  )
}
