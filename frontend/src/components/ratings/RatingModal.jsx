import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

const starVariants = {
  hover: { scale: 1.3, rotate: -10, transition: { type: 'spring', stiffness: 400 } },
  tap: { scale: 1.4, transition: { type: 'spring', stiffness: 400 } },
  filled: { color: '#f59e0b', textShadow: '0 0 10px rgba(245,158,11,0.3)' },
}

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
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Rate Your Ride
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          How was your trip?
        </motion.p>

        <div className="star-row">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.span
              key={n}
              className={`star ${n <= (hover || stars) ? 'filled' : ''}`}
              onClick={() => setStars(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              variants={starVariants}
              whileHover="hover"
              whileTap="tap"
              animate={n <= stars ? 'filled' : {}}
            >
              ★
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Optional: share your experience"
            rows={3}
            maxLength={500}
          />
        </motion.div>

        <motion.div
          className="btn-row"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <motion.button
            className="btn-primary"
            onClick={submit}
            disabled={loading || stars === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Submitting...
              </span>
            ) : 'Submit Rating'}
          </motion.button>
          <motion.button
            className="btn-secondary"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Skip
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
