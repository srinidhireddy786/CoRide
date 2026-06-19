import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { geocodeAddress, calculateRoute } from '../../lib/tomtom'
import { POPULAR_ROUTES } from '../../lib/hyderabad'
import AddressAutocomplete from '../AddressAutocomplete'

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.05 } }),
}

export default function PublishRide() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState({
    from_city: '', to_city: '', vehicle_id: '',
    departure_time: '', total_seats: 1, final_cost: '',
  })
  const [fromCoords, setFromCoords] = useState(null)
  const [toCoords, setToCoords] = useState(null)
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

  const selectRoute = (from, to) => {
    setForm({ ...form, from_city: from, to_city: to })
    setFromCoords(null)
    setToCoords(null)
  }

  const handleFromSelect = (item) => {
    setFromCoords({ lat: item.lat, lon: item.lon })
  }

  const handleToSelect = (item) => {
    setToCoords({ lat: item.lat, lon: item.lon })
  }

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
        fromCoords || geocodeAddress(from_city.trim()),
        toCoords || geocodeAddress(to_city.trim()),
      ])

      let distance = null
      try {
        const route = await calculateRoute(fromCoord.lat, fromCoord.lon, toCoord.lat, toCoord.lon)
        distance = route.distanceMeters / 1000
      } catch {
        // Non-critical
      }

      await api.post('/api/rides', {
        from_city: from_city.trim(),
        to_city: to_city.trim(),
        from_lat: fromCoord.lat,
        from_lng: fromCoord.lon,
        to_lat: toCoord.lat,
        to_lng: toCoord.lon,
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
      setFromCoords(null)
      setToCoords(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!vehicles.length) {
    return (
      <motion.div
        className="empty-state"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>No vehicle registered</h2>
        <p>Add a vehicle first to publish a ride.</p>
      </motion.div>
    )
  }

  const fields = [
    { field: 'from_city', label: 'From', placeholder: 'e.g. Gachibowli', icon: 'location_on', i: 0 },
    { field: 'to_city', label: 'To', placeholder: 'e.g. HITEC City', icon: 'near_me', i: 1 },
  ]

  return (
    <motion.div
      className="form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Offer a Ride
      </motion.h2>
      <motion.p
        className="subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        Publish your trip details
      </motion.p>

      {error && (
        <motion.div
          className="error-box"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          {fields.map(({ field, label, placeholder, icon, i }) => (
            <motion.label
              key={field}
              custom={i}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              {label}
              <AddressAutocomplete
                value={form[field]}
                onChange={(val) => {
                  setForm({ ...form, [field]: val })
                  if (field === 'from_city') setFromCoords(null)
                  else setToCoords(null)
                }}
                onSelect={field === 'from_city' ? handleFromSelect : handleToSelect}
                placeholder={placeholder}
                icon={icon}
              />
            </motion.label>
          ))}
        </div>

        <motion.div
          className="quick-routes"
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="hint">Popular routes</p>
          <div className="route-chips">
            {POPULAR_ROUTES.slice(0, 6).map((r, i) => (
              <motion.button
                key={i}
                type="button"
                className={`route-chip ${form.from_city === r.from && form.to_city === r.to ? 'active' : ''}`}
                onClick={() => selectRoute(r.from, r.to)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {r.from} → {r.to}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.label
          custom={3}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          Vehicle
          <select
            value={form.vehicle_id || ''}
            onChange={update('vehicle_id')}
            className="vehicle-select"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model} ({v.registration_number})
              </option>
            ))}
          </select>
        </motion.label>

        <motion.label
          custom={4}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          Departure Time
          <input type="datetime-local" value={form.departure_time} onChange={update('departure_time')} />
        </motion.label>

        <div className="form-row">
          <motion.label
            custom={5}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            Available Seats
            <select value={form.total_seats} onChange={updateNum('total_seats')}>
              {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </motion.label>
          <motion.label
            custom={6}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            Cost per Seat (₹)
            <input type="number" min="0" value={form.final_cost} onChange={update('final_cost')} placeholder="e.g. 50" />
          </motion.label>
        </div>

        <motion.div
          custom={7}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Publishing...
              </span>
            ) : 'Publish Ride'}
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}
