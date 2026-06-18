import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useRideStatus } from '../hooks/useRideStatus'
import RequestButton from '../components/bookings/RequestButton'
import RouteMap from '../components/maps/RouteMap'

const STEP_ORDER = ['confirmed', 'driver_en_route', 'arrived', 'completed']

const STEP_CONFIG = {
  confirmed: { icon: 'check', label: 'Request Confirmed' },
  driver_en_route: { icon: 'electric_car', label: 'Driver en route' },
  arrived: { icon: 'pin_drop', label: 'Arrived at Pickup' },
  completed: { icon: 'flag', label: 'Final Destination' },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const getCurrentStep = (status) => {
  const idx = STEP_ORDER.indexOf(status)
  return idx >= 0 ? idx : -1
}

export default function RideDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const isDriver = ride?.owner_id === user?.id

  const fetchData = async () => {
    const data = await api.get(`/api/rides/${id}`)
    setRide(data)
    setLoading(false)
  }

  const { startRide, completeRide, cancelRide, updating } = useRideStatus(ride, fetchData)

  useEffect(() => {
    fetchData()
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return
    setCancelling(true)
    try {
      await api.post(`/api/requests/${id}/cancel`)
      await fetchData()
    } catch {
      await api.patch(`/api/rides/${id}/cancel`).catch(() => {})
      await fetchData()
    }
    setCancelling(false)
  }

  const currentStep = getCurrentStep(ride?.status)
  const canStart = isDriver && ride?.status === 'open'
  const canComplete = isDriver && ride?.status === 'in_progress'

  if (loading) return (
    <div className="loading">
      <div className="spinner spinner-lg" />
      <span>Loading ride details...</span>
    </div>
  )

  if (!ride) return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h3>Ride not found</h3>
    </motion.div>
  )

  return (
    <motion.div
      className="ride-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.header
        className="ride-detail-header"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div>
          <nav className="ride-breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/rides')}>Rides</button>
            <span className="material-symbols-outlined breadcrumb-chevron">chevron_right</span>
            <span className="breadcrumb-current">#CR-{ride.id}-HYD</span>
          </nav>
          <h1 className="ride-detail-title">{ride.from_city} → {ride.to_city}</h1>
        </div>
        <div className="ride-header-actions">
          <span className="live-badge">
            <span className="live-badge-dot" />
            Live Tracking
          </span>
          <button className="share-btn">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </motion.header>

      {/* Main Grid */}
      <div className="ride-detail-grid">
        {/* Left Column: Map + Timeline */}
        <div className="ride-detail-left">
          {/* Map Section */}
          <motion.div
            className="ride-map-section"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <RouteMap
              from={{ lat: ride.from_lat, lng: ride.from_lng }}
              to={{ lat: ride.to_lat, lng: ride.to_lng }}
              height={300}
            />
            <div className="ride-map-overlay-panel glass-panel">
              <div className="map-overlay-item">
                <span className="map-overlay-label">Estimated Arrival</span>
                <span className="map-overlay-value">
                  {ride.departure_time
                    ? new Date(ride.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : '--'}
                </span>
              </div>
              <div className="map-overlay-divider" />
              <div className="map-overlay-item">
                <span className="map-overlay-label">Distance</span>
                <span className="map-overlay-value">{ride.distance_km || '--'} km</span>
              </div>
            </div>
          </motion.div>

          {/* Journey Timeline */}
          <motion.div
            className="journey-timeline"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
          >
            <h3 className="journey-timeline-title">Journey Timeline</h3>
            <div className="timeline-steps">
              {STEP_ORDER.map((step, idx) => {
                const config = STEP_CONFIG[step]
                const isCompleted = currentStep > idx
                const isActive = currentStep === idx
                const isFuture = currentStep < idx

                return (
                  <div
                    key={step}
                    className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isFuture ? 'future' : ''}`}
                  >
                    <div className={`timeline-step-icon ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                      {isCompleted ? (
                        <span className="material-symbols-outlined">check</span>
                      ) : (
                        <span className="material-symbols-outlined">{config.icon}</span>
                      )}
                    </div>
                    <div className="timeline-step-info">
                      <span className="timeline-step-label">{config.label}</span>
                      <span className="timeline-step-time">
                        {isCompleted && ride.departure_time
                          ? new Date(ride.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                          : isActive
                            ? 'Current Stage'
                            : `ETA ${new Date(ride.departure_time || Date.now() + (idx * 30 * 60000)).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                        }
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Driver, Route, Actions */}
        <aside className="ride-detail-right">
          {/* Driver & Vehicle */}
          <motion.div
            className="detail-card"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className="driver-header">
              <div className="driver-avatar-wrap">
                <div className="driver-avatar">
                  {ride.driver_name ? ride.driver_name.charAt(0).toUpperCase() : '?'}
                </div>
              </div>
              <div className="driver-info">
                <h2 className="driver-name">{ride.driver_name}</h2>
                <div className="driver-rating-row">
                  <span className="material-symbols-outlined driver-rating-icon">star</span>
                  <span className="driver-rating-value">{ride.driver_avg_rating ? Number(ride.driver_avg_rating).toFixed(1) : '-'}</span>
                </div>
              </div>
            </div>

            <div className="driver-vehicle-card">
              <span className="material-symbols-outlined driver-vehicle-icon">directions_car</span>
              <div>
                <p className="driver-vehicle-name">{ride.vehicle_name || 'Tesla Model 3'} &bull; Pearl White</p>
                <p className="driver-vehicle-plate">{ride.vehicle_plate || 'TS 09 EL 2024'}</p>
              </div>
            </div>

            <div className="driver-actions">
              <motion.button
                className="driver-chat-btn"
                onClick={() => navigate(`/chat/${ride.id}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                Chat with Driver
              </motion.button>
              <motion.button
                className="driver-track-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="material-symbols-outlined">track_changes</span>
                Track Live
              </motion.button>
            </div>

            {!isDriver && (
              <div style={{ marginTop: 12 }}>
                <RequestButton ride={ride} onUpdate={fetchData} />
              </div>
            )}

            {canStart && (
              <motion.button
                className="btn-success"
                onClick={startRide}
                disabled={updating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: 12, width: '100%' }}
              >
                {updating ? 'Starting...' : 'Start Ride'}
              </motion.button>
            )}

            {canComplete && (
              <motion.button
                className="btn-success"
                onClick={completeRide}
                disabled={updating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: 12, width: '100%' }}
              >
                {updating ? 'Completing...' : 'Complete Ride'}
              </motion.button>
            )}
          </motion.div>

          {/* Route Details */}
          <motion.div
            className="detail-card"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.25 }}
          >
            <h3 className="detail-card-title">Route Details</h3>
            <div className="route-detail-lines">
              <div className="route-detail-point">
                <div className="route-detail-dot route-dot-pickup" />
                <div>
                  <span className="route-point-label">Pickup Location</span>
                  <span className="route-point-address">{ride.from_city || 'T-Hub 2.0, HITEC City'}</span>
                </div>
              </div>
              <div className="route-detail-point">
                <div className="route-detail-dot route-dot-dropoff" />
                <div>
                  <span className="route-point-label">Drop-off Location</span>
                  <span className="route-point-address">{ride.to_city || 'Microsoft Campus, Gachibowli'}</span>
                </div>
              </div>
            </div>
            <div className="route-fare-row">
              <div>
                <span className="route-fare-label">Estimated Fare</span>
                <span className="route-fare-value">₹{(ride.final_cost || ride.price_per_seat || 450).toFixed(2)}</span>
              </div>
              <span className="route-corp-badge">Corporate Pay</span>
            </div>
          </motion.div>

          {/* Cancel Button */}
          {!isDriver && (
            <motion.button
              className="cancel-request-btn"
              onClick={handleCancel}
              disabled={cancelling}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-symbols-outlined">cancel</span>
              {cancelling ? 'Cancelling...' : 'Cancel Request'}
            </motion.button>
          )}

          {isDriver && (ride.status === 'open' || ride.status === 'in_progress') && (
            <motion.button
              className="cancel-request-btn"
              onClick={cancelRide}
              disabled={updating}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-symbols-outlined">cancel</span>
              {updating ? 'Cancelling...' : 'Cancel Ride'}
            </motion.button>
          )}

          {/* Safety Section */}
          <motion.section
            className="safety-section"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.35 }}
          >
            <h3 className="safety-section-title">Ride Experience & Safety</h3>
            <div className="safety-grid">
              <div className="safety-card">
                <span className="material-symbols-outlined safety-card-icon">gpp_good</span>
                <h4 className="safety-card-title">Safety Shield</h4>
                <p className="safety-card-desc">Your ride is protected with real-time GPS monitoring and SOS support.</p>
              </div>
              <div className="safety-card">
                <span className="material-symbols-outlined safety-card-icon">air</span>
                <h4 className="safety-card-title">Climate Preferences</h4>
                <p className="safety-card-desc">Pre-set to 22&deg;C. Air purifier active for your comfort.</p>
              </div>
              <div className="safety-card">
                <span className="material-symbols-outlined safety-card-icon">support_agent</span>
                <h4 className="safety-card-title">Concierge Support</h4>
                <p className="safety-card-desc">24/7 priority support available for any route adjustments.</p>
              </div>
            </div>
          </motion.section>
        </aside>
      </div>
    </motion.div>
  )
}
