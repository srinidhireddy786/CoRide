const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'

export async function getDistance(fromLng, fromLat, toLng, toLat) {
  const url = `${OSRM_URL}/${fromLng},${fromLat};${toLng},${toLat}?overview=false`
  const res = await fetch(url)

  if (!res.ok) throw new Error('Could not calculate distance.')

  const data = await res.json()
  if (!data.routes?.length) throw new Error('No route found between these cities.')

  return data.routes[0].distance / 1000
}
