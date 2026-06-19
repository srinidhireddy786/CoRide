const API_KEY = () => import.meta.env.VITE_TOMTOM_API_KEY

const BASE = 'https://api.tomtom.com'
const HYDERABAD_CENTER = { lat: 17.385, lon: 78.4867 }
const RADIUS = 50000

export async function geocodeAddress(query) {
  const url = `${BASE}/search/2/geocode/${encodeURIComponent(query)}.json?key=${API_KEY()}&countrySet=IN&limit=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoding failed.')
  const data = await res.json()
  if (!data.results?.length) throw new Error(`"${query}" not found.`)
  const r = data.results[0].position
  return { lat: r.lat, lon: r.lng ?? r.lon, formattedAddress: data.results[0].address.freeformAddress }
}

export async function searchAddress(query) {
  if (!query || query.length < 2) return []
  const url = `${BASE}/search/2/search/${encodeURIComponent(query)}.json?key=${API_KEY()}&countrySet=IN&limit=5&lat=${HYDERABAD_CENTER.lat}&lon=${HYDERABAD_CENTER.lon}&radius=${RADIUS}&typeahead=true`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  if (!data.results) return []
  return data.results.map((r) => ({
    label: r.address.freeformAddress,
    lat: r.position.lat,
    lon: r.position.lng ?? r.position.lon,
  }))
}

export async function calculateRoute(startLat, startLon, endLat, endLon) {
  const url = `${BASE}/routing/1/calculateRoute/${startLat},${startLon}:${endLat},${endLon}/json?key=${API_KEY()}&traffic=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Route calculation failed.')
  const data = await res.json()
  const route = data.routes[0]
  const summary = route.summary
  const points = route.legs[0].points || []
  const routeGeometry = points.map((p) => ({ lat: p.latitude, lon: p.longitude }))
  return {
    distanceMeters: summary.lengthInMeters,
    durationSeconds: summary.travelTimeInSeconds,
    trafficDurationSeconds: summary.travelTimeInSeconds + (summary.trafficDelayInSeconds || 0),
    routeGeometry,
  }
}
