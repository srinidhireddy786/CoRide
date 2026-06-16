import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Join CoRide</h1>
        <p className="subtitle">Ride together, save together</p>

        {error && <div className="error-box">{error}</div>}

        <label>
          Full Name
          <input type="text" value={form.name} onChange={update('name')} placeholder="Your name" autoComplete="name" />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" />
        </label>
        <label>
          Phone
          <input type="tel" value={form.phone} onChange={update('phone')} placeholder="9876543210" autoComplete="tel" />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={update('password')} placeholder="Min 6 characters" autoComplete="new-password" />
        </label>
        <label>
          Confirm Password
          <input type="password" value={form.confirm} onChange={update('confirm')} placeholder="Repeat password" autoComplete="new-password" />
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
