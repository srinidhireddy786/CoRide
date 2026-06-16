import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import RequestButton from '../components/bookings/RequestButton'
import RequestList from '../components/bookings/RequestList'
import RouteMap from '../components/map/RouteMap'
import LiveTracker from '../components/map/LiveTracker'
import ChatWindow from '../components/chat/ChatWindow'
import RatingModal from '../components/ratings/RatingModal'
import { useRideStatus } from '../hooks/useRideStatus'

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

  // Show rating modal when ride completed and user hasn't rated yet
  useEffect(() => {
    if (!ride || isDriver || ride.status !== 'completed') return
    api.get(`/api/ratings/check/${id}`).then((res) => {
      if (!res.rated) setShowRating(true)
    })
  }, [ride?.status, ride?.id, isDriver])

  if (loading) return <div className="loading">Loading...</div>
  if (!ride) return <div className="empty-state"><h3>Ride not found</h3></div>

  const fromPt = { lat: ride.from_lat, lng: ride.from_lng, city: ride.from_city }
  const toPt = { lat: ride.to_lat, lng: ride.to_lng, city: ride.to_city }

  const canStart = isDriver && ride.status === 'open'
  const canComplete = isDriver && ride.status === 'in_progress'
  const canCancel = isDriver && (ride.status === 'open' || ride.status === 'in_progress')

  return (
    <div className="ride-detail">
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-header">
        <h2>{ride.from_city} → {ride.to_city}</h2>
        <p className="detail-time">{format(new Date(ride.departure_time), 'MMMM d, yyyy · h:mm a')}</p>
        <span className={`ride-status status-${ride.status}`}>{ride.status.replace('_', ' ')}</span>
      </div>

      <div className="detail-grid">
        <div className="detail-info">
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

          {isDriver && canStart && (
            <button className="btn-success" onClick={startRide} disabled={updating}>
              Start Ride
            </button>
          )}

          {canComplete && (
            <button className="btn-success" onClick={completeRide} disabled={updating}>
              Complete Ride
            </button>
          )}

          {canCancel && (
            <button className="btn-danger" onClick={cancelRide} disabled={updating}>
              Cancel Ride
            </button>
          )}
        </div>

        <div className="detail-map">
          <RouteMap from={fromPt} to={toPt} height="300px" />
        </div>
      </div>

      <LiveTracker ride={ride} />

      {bookingStatus && ['accepted', 'in_progress', 'completed'].includes(bookingStatus) && (
        <div className="detail-section">
          <h3>Contact</h3>
          <p><strong>Driver phone:</strong> {ride.driver_phone || 'Not provided'}</p>
        </div>
      )}

      {bookingStatus && ['accepted', 'in_progress'].includes(bookingStatus) && (
        <div className="detail-section">
          <h3>Chat</h3>
          <ChatWindow rideId={ride.id} />
        </div>
      )}

      {showRating && (
        <RatingModal
          booking={{ ride_id: id, rider_id: user.id }}
          ride={ride}
          onClose={() => { setShowRating(false); fetchData() }}
        />
      )}

      {isDriver && ride.status === 'open' && (
        <div className="detail-section">
          <h3>Requests</h3>
          <RequestList requests={requests} ride={ride} onUpdate={fetchData} />
        </div>
      )}
    </div>
  )
}
