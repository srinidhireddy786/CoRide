import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { signup } from '../../lib/auth'
import { useAuth } from '../../contexts/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const { name, email, phone, password, confirm } = form

    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const user = await signup({ name: name.trim(), email: email.trim(), phone: phone.trim(), password })
      authLogin(user)
      toast.success(`Welcome to CoRide, ${user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <motion.form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Join CoRide
        </motion.h1>
        <motion.p
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Ride together, save together
        </motion.p>

        {error && (
          <motion.div
            className="error-box"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {error}
          </motion.div>
        )}

        {[
          { field: 'name', label: 'Full Name', placeholder: 'Your name', delay: 0.2, type: 'text', autoComplete: 'name' },
          { field: 'email', label: 'Email', placeholder: 'you@example.com', delay: 0.24, type: 'email', autoComplete: 'email' },
          { field: 'phone', label: 'Phone', placeholder: '9876543210', delay: 0.28, type: 'tel', autoComplete: 'tel' },
          { field: 'password', label: 'Password', placeholder: 'Min 6 characters', delay: 0.32, type: 'password', autoComplete: 'new-password' },
          { field: 'confirm', label: 'Confirm Password', placeholder: 'Repeat password', delay: 0.36, type: 'password', autoComplete: 'new-password' },
        ].map(({ field, label, placeholder, delay, type, autoComplete }) => (
          <motion.label
            key={field}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
          >
            {label}
            <input
              type={type}
              value={form[field]}
              onChange={update(field)}
              placeholder={placeholder}
              autoComplete={autoComplete}
            />
          </motion.label>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </motion.div>

        <motion.p
          className="auth-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Already have an account? <Link to="/login">Log in</Link>
        </motion.p>
      </motion.form>
    </div>
  )
}
