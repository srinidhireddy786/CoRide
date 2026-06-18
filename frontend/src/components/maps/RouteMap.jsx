import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

function FitBounds({ from, to }) {
  const map = useMap()
  useEffect(() => {
    if (from && to) {
      const bounds = L.latLngBounds(
        [from.lat, from.lng],
        [to.lat, to.lng]
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, from, to])
  return null
}

export default function RouteMap({ from, to, height = 300, className = '' }) {
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

  const center = {
    lat: (from.lat + to.lat) / 2,
    lng: (from.lng + to.lng) / 2,
  }

  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden' }} className={className}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[from.lat, from.lng]} />
        <Marker position={[to.lat, to.lng]} />
        <Polyline
          positions={[
            [from.lat, from.lng],
            [to.lat, to.lng],
          ]}
          color="var(--primary, #008080)"
          weight={3}
          dashArray="8 6"
        />
        <FitBounds from={from} to={to} />
      </MapContainer>
    </div>
  )
}
