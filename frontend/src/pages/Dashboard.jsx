import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import AddVehicle from '../components/vehicles/AddVehicle'
import PublishRide from '../components/rides/PublishRide'
import SearchRides from './SearchRides'

export default function Dashboard() {
  const { user } = useAuth()
  const [mode, setMode] = useState(null)
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    if (user) {
      api.get('/api/vehicles').then((data) => {
        setVehicles(data || [])
      })
    }
  }, [user])

  const handleOfferRide = () => {
    if (vehicles.length === 0) {
      setMode('offer')
    } else {
      setMode('publish')
    }
  }

  if (!mode) {
    return (
      <div className="dashboard">
        <div className="welcome">
          <h1>Welcome, {user?.name}!</h1>
          <p>What would you like to do today?</p>
        </div>

        <div className="dashboard-cards">
          <button className="dash-card" onClick={handleOfferRide}>
            <span className="dash-icon">🚗</span>
            <h2>Offer a Ride</h2>
            <p>Publish your trip and help someone reach their destination</p>
          </button>
          <button className="dash-card" onClick={() => setMode('find')}>
            <span className="dash-icon">🔍</span>
            <h2>Find a Ride</h2>
            <p>Search for rides heading your way</p>
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'offer') {
    return (
      <div className="page-container">
        <button className="btn-back" onClick={() => setMode(null)}>← Back</button>
        <AddVehicle
          onSaved={() => {
            api.get('/api/vehicles').then((data) => {
              setVehicles(data || [])
              setMode('publish')
            })
          }}
          onSkip={() => setMode(null)}
        />
      </div>
    )
  }

  if (mode === 'publish') {
    return (
      <div className="page-container">
        <button className="btn-back" onClick={() => setMode(null)}>← Back</button>
        <PublishRide />
      </div>
    )
  }

  if (mode === 'find') {
    return (
      <div className="page-container">
        <button className="btn-back" onClick={() => setMode(null)}>← Back</button>
        <SearchRides />
      </div>
    )
  }

  return null
}
