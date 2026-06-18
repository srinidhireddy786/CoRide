import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import RouteMap from '../components/maps/RouteMap'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeRides, setActiveRides] = useState([])

  const firstName = user?.name?.split(' ')[0] || 'James'

  useEffect(() => {
    Promise.all([
      api.get('/api/rides/my').catch(() => []),
      api.get('/api/rides/joined').catch(() => []),
    ]).then(([offered, joined]) => {
      const active = []
      for (const r of (joined || [])) {
        if (r.booking_status === 'accepted' || r.status === 'in_progress') {
          active.push({ ...r, chatLabel: 'Chat with Driver', rideId: r.id })
        }
      }
      for (const r of (offered || [])) {
        if (r.status === 'in_progress' || r.status === 'open') {
          active.push({ ...r, chatLabel: 'Chat with Passengers', rideId: r.id })
        }
      }
      setActiveRides(active.slice(0, 4))
    })
  }, [])

  return (
    <div className="dash-page">
      <motion.div
        className="dash-hero"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <div className="dash-hero-bg">
          <img src="/images/driver-profile.jpg" alt="" />
          <div className="dash-hero-overlay" />
        </div>
        <div className="dash-hero-content">
          <h1 className="dash-greeting">Good morning, {firstName}</h1>
          <p className="dash-subtitle">Ready for your next commute?</p>
        </div>
      </motion.div>

      <div className="dash-grid">
        <div className="dash-main">
          <motion.div
            className="dash-bento"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              className="dash-find-card"
              variants={fadeUp}
              onClick={() => navigate('/search')}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="dash-card-icon">
                <span className="material-symbols-outlined">search</span>
              </div>
              <h3 className="dash-card-title">Find a Ride</h3>
              <p className="dash-card-desc">Join an existing carpool to your destination.</p>
              <span className="dash-card-link">
                Explore Routes <span className="material-symbols-outlined">arrow_forward</span>
              </span>
              <div className="dash-card-bg-icon">
                <span className="material-symbols-outlined">commute</span>
              </div>
            </motion.button>

            <motion.button
              className="dash-offer-card"
              variants={fadeUp}
              onClick={() => navigate('/offer-ride')}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="dash-card-icon dash-offer-icon">
                <span className="material-symbols-outlined">directions_car</span>
              </div>
              <h3 className="dash-card-title">Offer a Ride</h3>
              <p className="dash-card-desc">Share your journey and offset your commute costs.</p>
              <span className="dash-card-link">
                Post your Trip <span className="material-symbols-outlined">arrow_forward</span>
              </span>
              <div className="dash-card-bg-icon">
                <span className="material-symbols-outlined">electric_car</span>
              </div>
            </motion.button>
          </motion.div>

          {activeRides.length > 0 ? (
            <motion.section
              className="dash-active-rides"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <div className="dash-commute-header">
                <h2>
                  Active Rides
                  <span className="dash-pulse-dot"></span>
                </h2>
              </div>
              <div className="dash-active-list">
                {activeRides.map((ride, i) => (
                  <motion.div
                    key={ride.id}
                    className="dash-active-item"
                    variants={fadeUp}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="dash-active-route">
                      <span className="dash-active-cities">{ride.from_city} → {ride.to_city}</span>
                      <span className="dash-active-time">
                        {ride.departure_time
                          ? new Date(ride.departure_time).toLocaleString('en-IN', {
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <motion.button
                      className="dash-chat-btn"
                      onClick={() => navigate(`/chat/${ride.id}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="material-symbols-outlined">chat_bubble</span>
                      Chat
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section
              className="dash-commute-section"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <div className="dash-commute-header">
                <h2>
                  Your Next Commute
                  <span className="dash-pulse-dot"></span>
                </h2>
              </div>
              <div className="dash-commute-placeholder">
                <RouteMap
                  from={{ lat: 17.4483, lng: 78.3915 }}
                  to={{ lat: 17.4283, lng: 78.3485 }}
                  height={220}
                />
                <div className="dash-commute-placeholder-overlay">
                  <span className="material-symbols-outlined">route</span>
                  <h3>Plan your next ride</h3>
                  <p>Search for available routes or offer a ride to get started.</p>
                  <button className="dash-placeholder-btn" onClick={() => navigate('/search')}>
                    Search Routes
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          <motion.section
            className="dash-quick-links"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <button className="dash-quick-link" onClick={() => navigate('/my-rides')}>
              <span className="material-symbols-outlined">calendar_month</span>
              <span>My Rides</span>
            </button>
            <button className="dash-quick-link" onClick={() => navigate('/profile')}>
              <span className="material-symbols-outlined">person</span>
              <span>Profile</span>
            </button>
          </motion.section>
        </div>

        <aside className="dash-sidebar">
          <motion.div
            className="dash-sidebar-img-card"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            <img src="/images/corider.jpg" alt="" />
            <div className="dash-sidebar-img-overlay">
              <h4>CoRide Community</h4>
              <p>Connect with professionals on your route.</p>
            </div>
          </motion.div>

          <motion.div
            className="dash-stats"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={6}
          >
            <h3>Quick Stats</h3>
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <span className="material-symbols-outlined">done_all</span>
                <p className="dash-stat-num">0</p>
                <p className="dash-stat-label">Rides Completed</p>
              </div>
              <div className="dash-stat-card">
                <span className="material-symbols-outlined">eco</span>
                <p className="dash-stat-num">0</p>
                <p className="dash-stat-label">CO2 Saved</p>
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  )
}
