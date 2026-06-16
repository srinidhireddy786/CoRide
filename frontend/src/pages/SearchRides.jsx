import { useState, useEffect, useRef } from 'react'
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
      <h2>Find a Ride</h2>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input type="text" placeholder="From city (e.g. Gachibowli)" value={form.from} onChange={update('from')} />
          <input type="text" placeholder="To city (e.g. HITEC City)" value={form.to} onChange={update('to')} />
        </div>
        <div className="form-row">
          <input type="date" value={form.date} onChange={update('date')} />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {!form.from && !form.to && !results && (
        <div className="quick-routes">
          <h3>Popular Hyderabad Routes</h3>
          <div className="route-chips">
            {POPULAR_ROUTES.map((r, i) => (
              <button key={i} className="route-chip" onClick={() => quickRoute(r.from, r.to)}>
                {r.from} → {r.to}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {results !== null && !loading && (
        <div className="search-results">
          {results.length === 0 ? (
            <div className="empty-state">
              <h3>No rides found</h3>
              <p>Try different cities or a different date.</p>
              <button className="btn-secondary" onClick={() => setForm({ from: '', to: '', date: '' })} style={{ marginTop: 12 }}>
                Back to popular routes
              </button>
            </div>
          ) : (
            <>
              <p className="result-count">{results.length} ride{results.length > 1 ? 's' : ''} found</p>
              <div className="ride-list">
                {results.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={{ ...ride, owner_avg_rating: ride.driver_avg_rating }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
