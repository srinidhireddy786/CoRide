import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const data = await api.post('/api/auth/login', { email: email.trim(), password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-split-left">
        <div className="auth-left-bg">
          <img src="/images/login-bg.jpg" alt="" />
        </div>
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <motion.div
            className="auth-logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="material-symbols-outlined auth-logo-icon">directions_car</span>
            <span className="auth-logo-text">CoRide</span>
          </motion.div>

          <div>
            <motion.h1
              className="auth-left-heading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Elevate Your Daily Commute
            </motion.h1>
            <motion.p
              className="auth-left-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Experience the gold standard in corporate ride-sharing. Designed for professionals, refined for Hyderabad.
            </motion.p>
          </div>

          <motion.div
            className="auth-avatar-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="auth-avatar-group">
              <div className="auth-avatar-circle" style={{ background: '#e0e7ff' }}>JD</div>
              <div className="auth-avatar-circle" style={{ background: '#dbeafe' }}>RK</div>
              <div className="auth-avatar-circle" style={{ background: '#fce7f3' }}>SP</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="auth-split-right">
        <motion.div
          className="auth-form-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-mobile-logo">
            <span className="material-symbols-outlined">directions_car</span>
            <span>CoRide</span>
          </div>

          <h2 className="auth-form-title">Welcome Back</h2>
          <p className="auth-form-subtitle">Please enter your details to access your dashboard.</p>

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
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">EMAIL ADDRESS</label>
              <div className="input-wrap">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@company.com"
                  autoComplete="email"
                />
                <span className="material-symbols-outlined input-icon">mail</span>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">PASSWORD</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="auth-checkbox-mark">
                  <span className="material-symbols-outlined">check</span>
                </span>
                <span className="auth-checkbox-label">Remember me</span>
              </label>
              <button
                type="button"
                className="auth-forgot"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
