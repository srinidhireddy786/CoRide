import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { formatRideDateTime, formatVehicleName, getDriverName, getInitials, getStatusLabel } from '../lib/rideDisplay'

const rideVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1, ease: 'easeOut' },
  }),
}

export default function MyRides() {
  const [offered, setOffered] = useState([])
  const [joined, setJoined] = useState([])
  const [tab, setTab] = useState('upcoming')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/api/rides/my').then((d) => setOffered((d || []).map((ride) => ({ ...ride, user_role: 'Driver' })))).catch(() => {}),
      api.get('/api/rides/joined').then((d) => setJoined((d || []).map((ride) => ({ ...ride, user_role: 'Passenger' })))).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const allUpcoming = [...offered, ...joined].filter(
    (r) => r.status !== 'completed' && r.status !== 'cancelled'
  )

  const history = [...offered, ...joined].filter(
    (r) => r.status === 'completed'
  )

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner spinner-lg" />
        <span>Loading rides...</span>
      </div>
    )
  }

  return (
    <div className="rides-page">
      <motion.div
        className="rides-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1>My Rides</h1>
          <p className="rides-subtitle">Manage your scheduled commutes and view travel history.</p>
        </div>
      </motion.div>

      <div className="rides-tabs">
        <button
          className={`rides-tab ${tab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`rides-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'upcoming' ? (
          <motion.div
            key="upcoming"
            className="rides-upcoming"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {allUpcoming.length === 0 ? (
              <div className="empty-state">
                <h3>No upcoming rides</h3>
                <p>You don&apos;t have any scheduled rides yet. Find a ride or offer one to get started!</p>
              </div>
            ) : (
              allUpcoming.map((ride, i) => (
                <motion.div
                  key={ride.id || i}
                  className="rides-card"
                  custom={i}
                  variants={rideVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="rides-card-inner">
                    <div className="rides-route-col">
                      <div className="rides-badge-row">
                        <span className={`rides-badge ${ride.booking_status === 'accepted' ? 'confirmed' : 'pending'}`}>
                          {getStatusLabel(ride.status, ride.booking_status)}
                        </span>
                        <span className="rides-date">
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
                          {formatRideDateTime(ride.departure_time)}
                        </span>
                      </div>

                      <div className="rides-route-line">
                        <div className="rides-route-item">
                          <div className="rides-route-dot pickup"></div>
                          <div>
                            <p className="rides-location-name">{ride.from_city}</p>
                            <p className="rides-location-sub">Pickup</p>
                          </div>
                        </div>
                        <div className="rides-route-item">
                          <div className="rides-route-dot dropoff"></div>
                          <div>
                            <p className="rides-location-name">{ride.to_city}</p>
                            <p className="rides-location-sub">Drop-off</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rides-details-col">
                      <div className="rides-driver-section">
                        <div className="rides-driver">
                          <div className="rides-driver-avatar-wrap">
                            <div className="rides-driver-avatar">
                              {getInitials(getDriverName(ride))}
                            </div>
                            {(ride.booking_status === 'accepted' || ride.status === 'in_progress') && <div className="rides-avatar-pulse"></div>}
                          </div>
                          <div>
                            <span className="rides-role-label">{ride.user_role === 'Driver' ? 'You are driving' : 'Your driver'}</span>
                            <p className="rides-driver-name">{getDriverName(ride)}</p>

                          </div>
                        </div>
                        <div className="rides-action-block">
                          <div className="rides-vehicle-info">
                            <span className="rides-vehicle-label">Vehicle</span>
                            <p className="rides-vehicle-name">{formatVehicleName(ride)}</p>
                            {ride.vehicle_plate && <p className="rides-vehicle-plate">{ride.vehicle_plate}</p>}
                          </div>
                          <button
                            className="rides-action-btn"
                            onClick={() => navigate(`/rides/${ride.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            className="rides-history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {history.length === 0 ? (
              <div className="empty-state">
                <h3>No ride history</h3>
                <p>Your completed rides will appear here.</p>
              </div>
            ) : (
              <div className="rides-history-table-wrap">
                <table className="rides-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Route</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((ride, i) => (
                      <motion.tr
                        key={ride.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                      >
                        <td>
                          <p className="rides-td-primary">
                            {formatRideDateTime(ride.departure_time)}
                          </p>
                          <p className="rides-td-secondary">
                            {getStatusLabel(ride.status, ride.booking_status)}
                          </p>
                        </td>
                        <td>
                          <div className="rides-route-pair">
                            <span>{ride.from_city}</span>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>east</span>
                            <span>{ride.to_city}</span>
                          </div>
                        </td>
                        <td>
                          <span className="rides-role-badge">
                            {ride.user_role || 'Passenger'}
                          </span>
                        </td>
                        <td>
                          <span className="rides-status-completed">Completed</span>
                        </td>
                        <td className="rides-td-details">
                          <button
                            className="rides-details-link"
                            onClick={() => navigate(`/rides/${ride.id}`)}
                          >
                            Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
