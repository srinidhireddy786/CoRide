import { Link, useNavigate } from 'react-router-dom'
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
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-logo">CoRide</Link>

        <div className="nav-links">
          <Link to="/dashboard">Home</Link>
          <Link to="/my-rides">My Rides</Link>
          {user && <NotificationBell />}
          {user && (
            <>
              <Link to="/profile" className="nav-profile">
                {user.name?.charAt(0)?.toUpperCase()}
              </Link>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
