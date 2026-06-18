import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import NotificationBell from '../notifications/NotificationBell'
import { useState, useEffect, useCallback } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="nav-inner">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          <Link to="/" className="nav-logo">CoRide</Link>
        </motion.div>

        <div className="nav-links">
          <Link to="/dashboard">Home</Link>
          <Link to="/my-rides">My Rides</Link>
          {user && <NotificationBell />}
          {user && (
            <>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link to="/profile" className="nav-profile">
                  {user.name?.charAt(0)?.toUpperCase()}
                </Link>
              </motion.div>
              <motion.button
                onClick={handleLogout}
                className="btn-logout"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
