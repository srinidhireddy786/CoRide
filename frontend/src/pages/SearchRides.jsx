import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import RouteMap from '../components/maps/RouteMap'
import { formatCurrency, formatRideTime, formatVehicleName, getDriverName } from '../lib/rideDisplay'

const SORT_OPTIONS = [
  { value: 'earliest', label: 'Earliest Departure' },
  { value: 'price', label: 'Price: Low to High' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
}

export default function SearchRides() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ from: '', to: '', date: '' })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('earliest')

  const updateForm = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const search = async (fromOverride, toOverride) => {
    const fromVal = fromOverride || form.from
    const toVal = toOverride || form.to
    if (!fromVal.trim() || !toVal.trim()) return

    setLoading(true)
    setError('')

    try {
      const params = { from_city: fromVal.trim(), to_city: toVal.trim() }
      if (form.date) params.date = form.date
      const data = await api.get('/api/rides', params)
      setResults(data || [])
    } catch {
      setError('Search failed. Try again.')
    }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    search()
  }

  const sortedResults = results
    ? [...results].sort((a, b) => {
        if (sortBy === 'price')
          return (a.price_per_seat || a.final_cost || 0) - (b.price_per_seat || b.final_cost || 0)
        return new Date(a.departure_time || 0) - new Date(b.departure_time || 0)
      })
    : []

  return (
    <div className="search-rides-page">
      {/* Search Bar Card */}
      <motion.div
        className="search-bar-card"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="search-bar-grid">
            <div className="search-bar-field">
              <span className="material-symbols-outlined search-field-icon">location_on</span>
              <div className="search-field-content">
                <span className="search-field-label">Starting Point</span>
                <input
                  type="text"
                  placeholder="Enter origin"
                  value={form.from}
                  onChange={updateForm('from')}
                  className="search-field-input"
                />
              </div>
            </div>
            <div className="search-bar-divider" />
            <div className="search-bar-field">
              <span className="material-symbols-outlined search-field-icon">near_me</span>
              <div className="search-field-content">
                <span className="search-field-label">Destination</span>
                <input
                  type="text"
                  placeholder="Where to?"
                  value={form.to}
                  onChange={updateForm('to')}
                  className="search-field-input"
                />
              </div>
            </div>
            <div className="search-bar-divider" />
            <div className="search-bar-field search-bar-date-field">
              <span className="material-symbols-outlined search-field-icon">calendar_today</span>
              <div className="search-field-content">
                <span className="search-field-label">Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={updateForm('date')}
                  className="search-field-input"
                />
              </div>
              <motion.button
                type="submit"
                className="search-submit-btn"
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
              >
                <span className="material-symbols-outlined">search</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Results Area */}
      <div className="search-results-area">
          {error && (
            <motion.div
              className="error-box"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          {results !== null && !loading && (
            <motion.div
              className="results-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <span className="results-count">
                Showing <strong>{results.length} ride{results.length !== 1 ? 's' : ''}</strong> for {form.date ? new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }) : 'today'}
              </span>
              <div className="results-sort">
                <span className="results-sort-label">Sort by:</span>
                <select
                  className="results-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {results === null && !loading && !form.from && !form.to && (
              <motion.div
                key="initial"
                className="search-initial-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="empty-state">
                  <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)', marginBottom: 12 }}>search</span>
                  <h3>Find your perfect ride</h3>
                  <p>Enter your origin and destination to search for rides.</p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                className="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="spinner spinner-lg" />
                <span>Searching rides...</span>
              </motion.div>
            )}

            {results !== null && !loading && results.length === 0 && (
              <motion.div
                key="empty"
                className="search-initial-state"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="empty-state">
                  <h3>No rides found</h3>
                  <p>Try different cities, dates, or adjust your filters.</p>
                </div>
              </motion.div>
            )}

            {results !== null && !loading && results.length > 0 && (
              <motion.div
                key="results"
                className="ride-cards-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {sortedResults.map((ride, i) => (
                  <motion.div
                    key={ride.id}
                    className="ride-card-horizontal"
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    layout
                  >
                    <div className="ride-card-inner">
                      {/* Map Preview */}
                      <div className="ride-map-preview">
                        <RouteMap
                          from={{ lat: ride.from_lat, lng: ride.from_lng }}
                          to={{ lat: ride.to_lat, lng: ride.to_lng }}
                          height={160}
                        />
                        {ride.distance_km && (
                          <span className="ride-map-badge">{ride.distance_km} km Route</span>
                        )}
                      </div>

                      {/* Ride Info */}
                      <div className="ride-card-info">
                        <div className="ride-card-top">
                          <div>
                            <div className="ride-card-driver-row">
                              <h3 className="ride-card-driver-name">{getDriverName(ride)}</h3>
                              <span className="material-symbols-outlined ride-verified-icon">verified</span>
                              <div className="ride-rating-pill">
                                <span className="material-symbols-outlined ride-rating-star">star</span>
                                <span>{ride.driver_avg_rating ? Number(ride.driver_avg_rating).toFixed(1) : '-'}</span>
                              </div>
                            </div>
                            <p className="ride-card-vehicle">
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>directions_car</span>
                              {formatVehicleName(ride)}
                            </p>
                          </div>
                          <div className="ride-card-departure">
                            <span className="ride-departure-label">Departure</span>
                            <span className="ride-departure-time">{formatRideTime(ride.departure_time)}</span>
                          </div>
                        </div>

                        <div className="ride-card-features">
                          {ride.available_seats != null && (
                            <div className="ride-feature-item">
                              <span className="material-symbols-outlined">event_seat</span>
                              <span>{ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left</span>
                            </div>
                          )}
                          {ride.distance_km != null && (
                            <div className="ride-feature-item">
                              <span className="material-symbols-outlined">route</span>
                              <span>{Number(ride.distance_km).toFixed(1)} km</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="ride-card-cta">
                        <div className="ride-card-price">
                          <span className="ride-price-label">Total per seat</span>
                          <span className="ride-price-value">{formatCurrency(ride.price_per_seat ?? ride.final_cost)}</span>
                        </div>
                        <motion.button
                          className="ride-book-btn"
                          onClick={() => navigate(`/rides/${ride.id}`)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Book Now
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  )
}
