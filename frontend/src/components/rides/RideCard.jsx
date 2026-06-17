import { format } from 'date-fns'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export default function RideCard({ ride, index = 0 }) {
  const navigate = useNavigate()
  const rating = ride.owner_avg_rating
    ? `★ ${Number(ride.owner_avg_rating).toFixed(1)}`
    : '★ New'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link to={`/rides/${ride.id}`} className="ride-card">
        <div className="ride-card-header">
          <span className="ride-price">₹{ride.final_cost}<span>/seat</span></span>
          <span className={`ride-status status-${ride.status}`}>{ride.status}</span>
        </div>

        <div className="ride-route">
          <div className="route-point">
            <span className="dot dot-green" />
            <span className="city">{ride.from_city}</span>
          </div>
          <div className="route-line" />
          <div className="route-point">
            <span className="dot dot-red" />
            <span className="city">{ride.to_city}</span>
          </div>
        </div>

        <div className="ride-card-footer">
          <span className="ride-time">
            {format(new Date(ride.departure_time), 'MMM d, h:mm a')}
          </span>
          <span className="ride-seats">
            {ride.available_seats} / {ride.total_seats} seats
          </span>
          <span className="ride-rating">{rating}</span>
          <motion.button
            className="chat-icon-btn"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigate(`/chat/${ride.id}`)
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Chat"
          >
            <MessageCircle size={18} />
          </motion.button>
        </div>
      </Link>
    </motion.div>
  )
}
