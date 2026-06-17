import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import NotificationBell from '../notifications/NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.nav
      className="navbar scrolled"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="nav-inner">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/dashboard" className="nav-logo">CoRide</Link>
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
