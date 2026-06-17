const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const HYDERABAD_VIEWBOX = '78.2,17.6,78.7,17.3'

let lastGeocodeTime = 0

export async function geocode(city) {
  const now = Date.now()
  const elapsed = now - lastGeocodeTime
  if (elapsed < 1100) {
    await new Promise(r => setTimeout(r, 1100 - elapsed))
  }

  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(city)}&format=json&limit=1&countrycodes=in&viewbox=${HYDERABAD_VIEWBOX}`
  const res = await fetch(url, { headers: { 'User-Agent': 'CoRide/1.0' } })

  if (res.status === 429) throw new Error('Rate limited. Try again in a moment.')
  if (!res.ok) throw new Error('Geocoding failed. Check your connection.')

  const data = await res.json()
  if (!data.length) throw new Error(`"${city}" not found. Try a different city name.`)

  lastGeocodeTime = Date.now()
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

export async function geocodeWithRetry(city, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await geocode(city)
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, 1500))
    }
  }
}
