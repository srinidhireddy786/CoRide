import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

export default function RatingModal({ booking, ride, onClose }) {
  const { user } = useAuth()
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [hover, setHover] = useState(0)
  const [loading, setLoading] = useState(false)

  if (!booking || booking.rider_id !== user.id) return null

  const submit = async () => {
    if (stars === 0) return toast.error('Select a rating.')
    setLoading(true)

    try {
      await api.post('/api/ratings', {
        ride_id: ride.id,
        stars,
        review: review.trim() || null,
      })
      toast.success('Rating submitted!')
      onClose?.()
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Rate Your Ride</h2>
        <p>How was your trip?</p>

        <div className="star-row">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`star ${n <= (hover || stars) ? 'filled' : ''}`}
              onClick={() => setStars(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Optional: share your experience"
          rows={3}
          maxLength={500}
        />

        <div className="btn-row">
          <button className="btn-primary" onClick={submit} disabled={loading || stars === 0}>
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
          <button className="btn-secondary" onClick={onClose}>Skip</button>
        </div>
      </div>
    </div>
  )
}
