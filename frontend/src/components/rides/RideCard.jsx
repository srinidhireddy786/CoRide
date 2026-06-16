import { format } from 'date-fns'
import { Link } from 'react-router-dom'

export default function RideCard({ ride }) {
  const rating = ride.owner_avg_rating
    ? `★ ${Number(ride.owner_avg_rating).toFixed(1)}`
    : '★ New'

  return (
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
      </div>
    </Link>
  )
}
