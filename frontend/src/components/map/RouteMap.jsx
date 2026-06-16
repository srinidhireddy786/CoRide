import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { HYDERABAD_CENTER } from '../../lib/hyderabad'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function RouteMap({ from, to, driverLocation, height = '300px' }) {
  const hasCoords = from?.lat && from?.lng && to?.lat && to?.lng
  const center = hasCoords
    ? [(from.lat + to.lat) / 2, (from.lng + to.lng) / 2]
    : HYDERABAD_CENTER

  return (
    <div style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={hasCoords ? 11 : 12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hasCoords && (
          <>
            <Marker position={[from.lat, from.lng]}>
              <Popup>{from.city || 'Start'}</Popup>
            </Marker>
            <Marker position={[to.lat, to.lng]}>
              <Popup>{to.city || 'End'}</Popup>
            </Marker>
            <Polyline
              positions={[
                [from.lat, from.lng],
                [to.lat, to.lng],
              ]}
              color="#4f46e5"
              weight={3}
              opacity={0.7}
            />
          </>
        )}

        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]}>
            <Popup>Driver is here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
