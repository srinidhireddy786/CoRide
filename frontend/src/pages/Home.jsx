import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    navigate(user ? '/dashboard' : '/login', { replace: true })
  }, [user, loading, navigate])

  return (
    <div className="loading-page">
      <h1>CoRide</h1>
      <p>Loading...</p>
    </div>
  )
}
