import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

export default function AddVehicle({ onSaved, onSkip }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ type: 'car', brand: '', model: '', registration_number: '', seat_capacity: 4 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const updateNum = (field) => (e) => setForm({ ...form, [field]: parseInt(e.target.value) || 1 })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.brand.trim() || !form.model.trim() || !form.registration_number.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/vehicles', {
        type: form.type,
        brand: form.brand.trim(),
        model: form.model.trim(),
        registration_number: form.registration_number.trim(),
        seat_capacity: form.seat_capacity,
      })
    } catch (err) {
      setLoading(false)
      return setError(err.message)
    }
    setLoading(false)

    toast.success('Vehicle added!')
    onSaved?.()
  }

  return (
    <div className="vehicle-form-container">
      <h2>Add Your Vehicle</h2>
      <p className="subtitle">One-time setup to start offering rides</p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Vehicle Type
          <select value={form.type} onChange={update('type')}>
            <option value="car">Car</option>
            <option value="suv">SUV</option>
            <option value="bike">Bike</option>
          </select>
        </label>

        <label>
          Brand
          <input type="text" value={form.brand} onChange={update('brand')} placeholder="e.g. Maruti, Honda" />
        </label>

        <label>
          Model
          <input type="text" value={form.model} onChange={update('model')} placeholder="e.g. Swift, City" />
        </label>

        <label>
          Registration Number
          <input type="text" value={form.registration_number} onChange={update('registration_number')} placeholder="e.g. MH01AB1234" />
        </label>

        <label>
          Seats (excluding driver)
          <select value={form.seat_capacity} onChange={updateNum('seat_capacity')}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <div className="btn-row">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Vehicle'}
          </button>
          {onSkip && (
            <button type="button" className="btn-secondary" onClick={onSkip}>
              Skip
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
