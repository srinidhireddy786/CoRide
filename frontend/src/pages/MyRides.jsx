import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import RideCard from '../components/rides/RideCard'

export default function MyRides() {
  const { user } = useAuth()
  const [tab, setTab] = useState('offered')
  const [offered, setOffered] = useState([])
  const [joined, setJoined] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    Promise.all([
      api.get('/api/rides/my'),
      api.get('/api/rides/joined'),
    ]).then(([offeredData, joinedData]) => {
      setOffered(offeredData || [])
      setJoined(joinedData || [])
      setLoading(false)
    })
  }, [user])

  if (loading) return <div className="loading">Loading...</div>

  const currentTab = tab === 'offered' ? offered : joined

  return (
    <div className="my-rides-page">
      <h2>My Rides</h2>

      <div className="tabs">
        <button className={`tab ${tab === 'offered' ? 'active' : ''}`} onClick={() => setTab('offered')}>
          Offered ({offered.length})
        </button>
        <button className={`tab ${tab === 'joined' ? 'active' : ''}`} onClick={() => setTab('joined')}>
          Joined ({joined.length})
        </button>
      </div>

      {currentTab.length === 0 ? (
        <div className="empty-state">
          <h3>No rides yet</h3>
          <p>{tab === 'offered' ? 'You haven\'t offered any rides.' : 'You haven\'t joined any rides.'}</p>
        </div>
      ) : (
        <div className="ride-list">
          {currentTab.map((ride) => (
            <RideCard key={ride.id} ride={{ ...ride, owner_avg_rating: ride.driver_avg_rating }} />
          ))}
        </div>
      )}
    </div>
  )
}
