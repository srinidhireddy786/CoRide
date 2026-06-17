import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.05 } }),
}

export default function AddVehicle({ onSaved, onSkip }) {
  const [form, setForm] = useState({ type: 'car', brand: '', model: '', reg_no: '', seat_capacity: 4 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const updateNum = (field) => (e) => setForm({ ...form, [field]: parseInt(e.target.value) || 1 })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const { brand, model, reg_no } = form
    if (!brand.trim() || !model.trim() || !reg_no.trim()) {
      return setError('Brand, model and registration number are required.')
    }

    setLoading(true)
    try {
      await api.post('/api/vehicles', {
        type: form.type,
        brand: brand.trim(),
        model: model.trim(),
        registration_number: reg_no.trim().toUpperCase(),
        seat_capacity: form.seat_capacity,
      })
      toast.success('Vehicle added!')
      onSaved?.()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const fields = [
    { field: 'brand', label: 'Brand', placeholder: 'e.g. Maruti Suzuki', type: 'text', i: 0 },
    { field: 'model', label: 'Model', placeholder: 'e.g. Swift', type: 'text', i: 1 },
    { field: 'reg_no', label: 'Registration Number', placeholder: 'e.g. TS 01 AB 1234', type: 'text', i: 2 },
  ]

  return (
    <motion.div
      className="vehicle-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2>Add a Vehicle</h2>
      <p className="subtitle">You need a vehicle to offer rides</p>

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
        {fields.map(({ field, label, placeholder, type, i }) => (
          <motion.label
            key={field}
            custom={i}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            {label}
            <input
              type={type}
              value={form[field]}
              onChange={update(field)}
              placeholder={placeholder}
            />
          </motion.label>
        ))}

        <div className="form-row">
          <motion.label
            custom={3}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            Type
            <select value={form.type} onChange={update('type')}>
              <option value="car">Car</option>
              <option value="suv">SUV</option>
              <option value="bike">Bike</option>
            </select>
          </motion.label>
          <motion.label
            custom={4}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            Seats
            <select value={form.seat_capacity} onChange={updateNum('seat_capacity')}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </motion.label>
        </div>

        <motion.div
          className="btn-row"
          custom={5}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Adding...
              </span>
            ) : 'Add Vehicle'}
          </button>
          {onSkip && (
            <motion.button
              type="button"
              className="btn-secondary"
              onClick={onSkip}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Skip
            </motion.button>
          )}
        </motion.div>
      </form>
    </motion.div>
  )
}
