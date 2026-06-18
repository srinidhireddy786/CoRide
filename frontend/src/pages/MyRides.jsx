import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

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
      api.get('/api/rides/my').then((d) => setOffered(d || [])).catch(() => {}),
      api.get('/api/rides/joined').then((d) => setJoined(d || [])).catch(() => {}),
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
                        <span className={`rides-badge ${ride.status === 'confirmed' ? 'confirmed' : 'pending'}`}>
                          {ride.status === 'confirmed' ? 'Confirmed' : 'Pending Confirmation'}
                        </span>
                        <span className="rides-date">
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
                          {new Date(ride.departure_time || Date.now()).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          {new Date(ride.departure_time || Date.now()).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="rides-route-line">
                        <div className="rides-route-item">
                          <div className="rides-route-dot pickup"></div>
                          <div>
                            <p className="rides-location-name">{ride.from_city || 'Knowledge City, Hitech City'}</p>
                            <p className="rides-location-sub">Office Entrance, Tower A</p>
                          </div>
                        </div>
                        <div className="rides-route-item">
                          <div className="rides-route-dot dropoff"></div>
                          <div>
                            <p className="rides-location-name">{ride.to_city || 'Financial District, Gachibowli'}</p>
                            <p className="rides-location-sub">Gate 3, Corporate Park</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rides-details-col">
                      <div className="rides-driver-section">
                        <div className="rides-driver">
                          <div className="rides-driver-avatar-wrap">
                            <div className="rides-driver-avatar">
                              {ride.owner_name
                                ? ride.owner_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                                : 'RK'}
                            </div>
                            {ride.status === 'confirmed' && <div className="rides-avatar-pulse"></div>}
                          </div>
                          <div>
                            <span className="rides-role-label">Your Driver</span>
                            <p className="rides-driver-name">{ride.owner_name || 'Rajesh Kumar'}</p>

                          </div>
                        </div>
                        <div className="rides-action-block">
                          <div className="rides-vehicle-info">
                            <span className="rides-vehicle-label">Vehicle</span>
                            <p className="rides-vehicle-name">{ride.vehicle_name || 'Audi e-tron GT'}</p>
                            <p className="rides-vehicle-plate">{ride.vehicle_plate || 'TS 09 EL 2024'}</p>
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
                            {new Date(ride.departure_time || Date.now()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="rides-td-secondary">
                            {new Date(ride.departure_time || Date.now()).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </td>
                        <td>
                          <div className="rides-route-pair">
                            <span>{ride.from_city || 'Financial Dist.'}</span>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>east</span>
                            <span>{ride.to_city || 'Banjara Hills'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="rides-role-badge">
                            {ride.role || 'Driver'}
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
