import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import AddVehicle from '../components/vehicles/AddVehicle'
import { geocodeWithRetry } from '../lib/geocode'
import { getDistance } from '../lib/osrm'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
  }),
}

export default function OfferRide() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    from_city: '',
    to_city: '',
    departure_date: '',
    departure_time: '',
    total_seats: 3,
    final_cost: '',
    vehicle_id: '',
  })

  useEffect(() => {
    api.get('/api/vehicles')
      .then((data) => {
        setVehicles(data || [])
        if (data?.length > 0) {
          setForm((f) => ({ ...f, vehicle_id: data[0].id }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.from_city.trim() || !form.to_city.trim()) {
      return setError('Please fill in origin and destination.')
    }
    if (!form.departure_date || !form.departure_time) {
      return setError('Please select departure date and time.')
    }
    if (!form.vehicle_id) {
      return setError('Please add a vehicle first.')
    }
    if (!form.final_cost || parseFloat(form.final_cost) <= 0) {
      return setError('Please enter a valid fare.')
    }

    const departureTime = `${form.departure_date}T${form.departure_time}:00`

    setSaving(true)
    try {
      const [fromCoord, toCoord] = await Promise.all([
        geocodeWithRetry(form.from_city.trim()),
        geocodeWithRetry(form.to_city.trim()),
      ])

      const distanceKm = await getDistance(
        fromCoord.lng,
        fromCoord.lat,
        toCoord.lng,
        toCoord.lat
      ).catch(() => null)

      await api.post('/api/rides', {
        from_city: form.from_city.trim(),
        to_city: form.to_city.trim(),
        from_lat: fromCoord.lat,
        from_lng: fromCoord.lng,
        to_lat: toCoord.lat,
        to_lng: toCoord.lng,
        departure_time: departureTime,
        total_seats: parseInt(form.total_seats),
        final_cost: parseFloat(form.final_cost),
        vehicle_id: form.vehicle_id,
        distance_km: distanceKm ? Number(distanceKm.toFixed(1)) : null,
      })
      navigate('/my-rides')
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const onVehicleSaved = () => {
    setShowAddVehicle(false)
    api.get('/api/vehicles').then((data) => {
      setVehicles(data || [])
      if (data?.length > 0) {
        setForm((f) => ({ ...f, vehicle_id: data[0].id }))
      }
    })
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner spinner-lg" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="offer-ride-page">
      <motion.div
        className="offer-ride-header"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1>Offer a Ride</h1>
        <p className="subtitle">Share your commute and split the costs.</p>
      </motion.div>

      {showAddVehicle ? (
        <AddVehicle onSaved={onVehicleSaved} onSkip={() => setShowAddVehicle(false)} />
      ) : (
        <motion.form
          className="offer-ride-form"
          onSubmit={handleSubmit}
          noValidate
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          {error && (
            <motion.div
              className="error-box"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="form-row">
            <label>
              From
              <input
                type="text"
                value={form.from_city}
                onChange={update('from_city')}
                placeholder="e.g. Hitech City"
              />
            </label>
            <label>
              To
              <input
                type="text"
                value={form.to_city}
                onChange={update('to_city')}
                placeholder="e.g. Gachibowli"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Departure Date
              <input
                type="date"
                value={form.departure_date}
                onChange={update('departure_date')}
              />
            </label>
            <label>
              Departure Time
              <input
                type="time"
                value={form.departure_time}
                onChange={update('departure_time')}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Available Seats
              <select value={form.total_seats} onChange={update('total_seats')}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              Fare per Seat (₹)
              <input
                type="number"
                min="0"
                step="10"
                value={form.final_cost}
                onChange={update('final_cost')}
                placeholder="e.g. 150"
              />
            </label>
          </div>

          <label>
            Vehicle
            <div className="vehicle-select-row">
              <select
                value={form.vehicle_id}
                onChange={update('vehicle_id')}
                disabled={vehicles.length === 0}
              >
                {vehicles.length === 0 ? (
                  <option value="">No vehicles available</option>
                ) : (
                  vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.registration_number})
                    </option>
                  ))
                )}
              </select>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddVehicle(true)}
              >
                + Add Vehicle
              </button>
            </div>
          </label>

          <div className="btn-row">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Posting...
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined">add_circle</span>
                  Post Ride
                </>
              )}
            </button>
          </div>
        </motion.form>
      )}
    </div>
  )
}
