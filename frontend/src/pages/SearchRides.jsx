import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { POPULAR_ROUTES } from '../lib/hyderabad'
import RideCard from '../components/rides/RideCard'

export default function SearchRides() {
  const [form, setForm] = useState({ from: '', to: '', date: '' })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const search = async () => {
    const { from, to, date } = form
    if (!from.trim() || !to.trim()) return

    setLoading(true)
    setError('')

    try {
      const params = { from_city: from.trim(), to_city: to.trim() }
      if (date) params.date = date
      const data = await api.get('/api/rides', params)
      setResults(data || [])
    } catch {
      setError('Search failed. Try again.')
    }
    setLoading(false)
  }

  const quickRoute = (from, to) => {
    setForm({ from, to, date: '' })
    setResults(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    search()
  }

  useEffect(() => {
    if (form.from.trim() && form.to.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(search, 600)
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [form.from, form.to])

  return (
    <div className="search-page">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Find a Ride
      </motion.h2>

      <motion.form
        className="search-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="form-row">
          <input type="text" placeholder="From city (e.g. Gachibowli)" value={form.from} onChange={update('from')} />
          <input type="text" placeholder="To city (e.g. HITEC City)" value={form.to} onChange={update('to')} />
        </div>
        <div className="form-row">
          <input type="date" value={form.date} onChange={update('date')} />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Searching...
              </span>
            ) : 'Search'}
          </button>
        </div>
      </motion.form>

      <AnimatePresence mode="wait">
        {!form.from && !form.to && !results && (
          <motion.div
            key="routes"
            className="quick-routes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Popular Hyderabad Routes</h3>
            <div className="route-chips">
              {POPULAR_ROUTES.map((r, i) => (
                <motion.button
                  key={i}
                  className="route-chip"
                  onClick={() => quickRoute(r.from, r.to)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {r.from} → {r.to}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          className="error-box"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {results !== null && !loading && (
          <motion.div
            key={results.length === 0 ? 'empty' : 'results'}
            className="search-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {results.length === 0 ? (
              <div className="empty-state">
                <h3>No rides found</h3>
                <p>Try different cities or a different date.</p>
                <motion.button
                  className="btn-secondary"
                  onClick={() => setForm({ from: '', to: '', date: '' })}
                  style={{ marginTop: 12 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to popular routes
                </motion.button>
              </div>
            ) : (
              <>
                <motion.p
                  className="result-count"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {results.length} ride{results.length > 1 ? 's' : ''} found
                </motion.p>
                <div className="ride-list">
                  {results.map((ride, i) => (
                    <RideCard
                      key={ride.id}
                      ride={{ ...ride, owner_avg_rating: ride.driver_avg_rating }}
                      index={i}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
