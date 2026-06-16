import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { geocodeWithRetry } from '../../lib/geocode'
import { getDistance } from '../../lib/osrm'
import { POPULAR_ROUTES } from '../../lib/hyderabad'

export default function PublishRide() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState({
    from_city: '', to_city: '', vehicle_id: '',
    departure_time: '', total_seats: 1, final_cost: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/vehicles').then((data) => {
      setVehicles(data || [])
      if (data?.length) setForm((f) => ({ ...f, vehicle_id: data[0].id }))
    })
  }, [user?.id])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const updateNum = (field) => (e) => setForm({ ...form, [field]: parseInt(e.target.value) || 1 })

  const selectRoute = (from, to) => setForm({ ...form, from_city: from, to_city: to })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const { from_city, to_city, vehicle_id, departure_time, total_seats, final_cost } = form

    if (!from_city.trim() || !to_city.trim() || !departure_time || !final_cost) {
      return setError('Please fill in all fields.')
    }

    if (from_city.trim().toLowerCase() === to_city.trim().toLowerCase()) {
      return setError('Source and destination must be different.')
    }

    const depTime = new Date(departure_time)
    if (depTime < new Date()) {
      return setError('Departure time cannot be in the past.')
    }

    setLoading(true)

    try {
      const [fromCoord, toCoord] = await Promise.all([
        geocodeWithRetry(from_city.trim()),
        geocodeWithRetry(to_city.trim()),
      ])

      let distance = null
      try {
        distance = await getDistance(fromCoord.lng, fromCoord.lat, toCoord.lng, toCoord.lat)
      } catch {
        // Non-critical
      }

      await api.post('/api/rides', {
        from_city: from_city.trim(),
        to_city: to_city.trim(),
        from_lat: fromCoord.lat,
        from_lng: fromCoord.lng,
        to_lat: toCoord.lat,
        to_lng: toCoord.lng,
        departure_time: depTime.toISOString(),
        total_seats,
        final_cost: parseFloat(final_cost),
        vehicle_id,
        distance_km: distance ? parseFloat(distance.toFixed(2)) : null,
      })
      toast.success('Ride published!')
      setForm({
        from_city: '', to_city: '', vehicle_id: vehicles[0]?.id || '',
        departure_time: '', total_seats: 1, final_cost: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!vehicles.length) {
    return (
      <div className="empty-state">
        <h2>No vehicle registered</h2>
        <p>Add a vehicle first to publish a ride.</p>
      </div>
    )
  }

  return (
    <div className="form-container">
      <h2>Offer a Ride</h2>
      <p className="subtitle">Publish your trip details</p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <label>
            From
            <input type="text" value={form.from_city} onChange={update('from_city')} placeholder="e.g. Gachibowli" />
          </label>
          <label>
            To
            <input type="text" value={form.to_city} onChange={update('to_city')} placeholder="e.g. HITEC City" />
          </label>
        </div>

        <div className="quick-routes">
          <p className="hint">Popular routes</p>
          <div className="route-chips">
            {POPULAR_ROUTES.slice(0, 6).map((r, i) => (
              <button
                key={i}
                type="button"
                className={`route-chip ${form.from_city === r.from && form.to_city === r.to ? 'active' : ''}`}
                onClick={() => selectRoute(r.from, r.to)}
              >
                {r.from} → {r.to}
              </button>
            ))}
          </div>
        </div>

        <label>
          Vehicle
          <select value={form.vehicle_id} onChange={update('vehicle_id')}>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model} ({v.registration_number})
              </option>
            ))}
          </select>
        </label>

        <label>
          Departure Time
          <input type="datetime-local" value={form.departure_time} onChange={update('departure_time')} />
        </label>

        <div className="form-row">
          <label>
            Available Seats
            <select value={form.total_seats} onChange={updateNum('total_seats')}>
              {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Cost per Seat (₹)
            <input type="number" min="0" value={form.final_cost} onChange={update('final_cost')} placeholder="e.g. 50" />
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Ride'}
        </button>
      </form>
    </div>
  )
}
