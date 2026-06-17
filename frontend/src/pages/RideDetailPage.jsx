import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import RequestButton from '../components/bookings/RequestButton'
import RequestList from '../components/bookings/RequestList'
import RouteMap from '../components/map/RouteMap'
import LiveTracker from '../components/map/LiveTracker'
import ChatWindow from '../components/chat/ChatWindow'
import RatingModal from '../components/ratings/RatingModal'
import { useRideStatus } from '../hooks/useRideStatus'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function RideDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [requests, setRequests] = useState([])
  const [showRating, setShowRating] = useState(false)
  const [loading, setLoading] = useState(true)

  const isDriver = ride?.owner_id === user?.id
  const bookingStatus = ride?.booking_status

  const fetchData = async () => {
    const rideData = await api.get(`/api/rides/${id}`)
    setRide(rideData)

    const userIsDriver = rideData?.owner_id === user?.id
    if (userIsDriver) {
      const reqData = await api.get(`/api/requests/ride/${id}`)
      setRequests(reqData || [])
    }

    setLoading(false)
  }

  const { startRide, completeRide, cancelRide, updating } = useRideStatus(ride, fetchData)

  useEffect(() => {
    fetchData()
  }, [id, user?.id])

  useEffect(() => {
    if (!ride || isDriver || ride.status !== 'completed') return
    api.get(`/api/ratings/check/${id}`).then((res) => {
      if (!res.rated) setShowRating(true)
    })
  }, [ride?.status, ride?.id, isDriver])

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

  const fromPt = { lat: ride.from_lat, lng: ride.from_lng, city: ride.from_city }
  const toPt = { lat: ride.to_lat, lng: ride.to_lng, city: ride.to_city }

  const canStart = isDriver && ride.status === 'open'
  const canComplete = isDriver && ride.status === 'in_progress'
  const canCancel = isDriver && (ride.status === 'open' || ride.status === 'in_progress')

  return (
    <motion.div
      className="ride-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        className="btn-back"
        onClick={() => navigate(-1)}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back
      </motion.button>

      <motion.div
        className="detail-header"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h2>{ride.from_city} → {ride.to_city}</h2>
        <p className="detail-time">{format(new Date(ride.departure_time), 'MMMM d, yyyy · h:mm a')}</p>
        <span className={`ride-status status-${ride.status}`}>{ride.status.replace('_', ' ')}</span>
      </motion.div>

      <div className="detail-grid">
        <motion.div
          className="detail-info"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <p><strong>Driver:</strong> {ride.driver_name}</p>
          <p><strong>Seats:</strong> {ride.available_seats} / {ride.total_seats}</p>
          <p><strong>Cost:</strong> ₹{ride.final_cost}/seat</p>
          {ride.distance_km && <p><strong>Distance:</strong> {ride.distance_km} km</p>}
          {ride.driver_avg_rating > 0 && (
            <p><strong>Rating:</strong> ★ {Number(ride.driver_avg_rating).toFixed(1)} ({ride.driver_total_ratings})</p>
          )}

          {!isDriver && (
            <div className="detail-actions">
              <RequestButton ride={ride} onUpdate={fetchData} />
            </div>
          )}

          {(isDriver || bookingStatus) && (
            <div className="detail-actions">
              <motion.button
                className="btn-primary"
                onClick={() => navigate(`/chat/${ride.id}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%' }}
              >
                💬 Chat
              </motion.button>
            </div>
          )}

          <motion.div
            className="detail-actions"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            {isDriver && canStart && (
              <motion.button
                className="btn-success"
                onClick={startRide}
                disabled={updating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
              >
                {updating ? 'Completing...' : 'Complete Ride'}
              </motion.button>
            )}

            {canCancel && (
              <motion.button
                className="btn-danger"
                onClick={cancelRide}
                disabled={updating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {updating ? 'Cancelling...' : 'Cancel Ride'}
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="detail-map"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <RouteMap from={fromPt} to={toPt} height="300px" />
        </motion.div>
      </div>

      <LiveTracker ride={ride} />

      {bookingStatus && ['accepted', 'in_progress', 'completed'].includes(bookingStatus) && (
        <motion.div
          className="detail-section"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
        >
          <h3>Contact</h3>
          <p><strong>Driver phone:</strong> {ride.driver_phone || 'Not provided'}</p>
        </motion.div>
      )}

      {(isDriver || bookingStatus) && (
        <motion.div
          className="detail-section"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <h3>Chat</h3>
          <ChatWindow rideId={ride.id} />
        </motion.div>
      )}

      {showRating && (
        <RatingModal
          booking={{ ride_id: id, rider_id: user.id }}
          ride={ride}
          onClose={() => { setShowRating(false); fetchData() }}
        />
      )}

      {isDriver && ride.status === 'open' && (
        <motion.div
          className="detail-section"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.35 }}
        >
          <h3>Requests</h3>
          <RequestList requests={requests} ride={ride} onUpdate={fetchData} />
        </motion.div>
      )}
    </motion.div>
  )
}
