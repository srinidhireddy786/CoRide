import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

export default function RequestButton({ ride, onUpdate }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState(null)

  useEffect(() => {
    if (ride?.booking_status) {
      setExisting({ id: ride.booking_id, status: ride.booking_status })
    } else {
      setExisting(null)
    }
  }, [ride])

  if (!ride) return null

  const isOwner = ride.owner_id === user?.id
  const isFull = ride.available_seats <= 0
  const isOpen = ride.status === 'open'

  if (isOwner) return null

  const handleRequest = async () => {
    if (!user.phone) {
      toast.error('Add your phone number in Profile before requesting.')
      return
    }

    setLoading(true)
    try {
      const data = await api.post(`/api/requests/ride/${ride.id}`)
      toast.success('Request sent!')
      setExisting(data)
      onUpdate?.()
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  const cancelRequest = async () => {
    setLoading(true)
    try {
      await api.patch(`/api/requests/${existing.id}?status=cancelled`)
      toast.success('Request cancelled.')
      setExisting(null)
      onUpdate?.()
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  if (existing?.status === 'accepted') {
    return <span className="badge badge-success">You're in!</span>
  }

  if (existing?.status === 'pending') {
    return (
      <button className="btn-secondary" onClick={cancelRequest} disabled={loading}>
        Cancel Request
      </button>
    )
  }

  if (existing?.status === 'rejected') {
    return <span className="badge badge-error">Request declined</span>
  }

  if (!isOpen) {
    return <span className="badge">{ride.status === 'completed' ? 'Completed' : 'In Progress'}</span>
  }

  if (isFull) {
    return <span className="badge badge-error">Fully Booked</span>
  }

  return (
    <button className="btn-primary" onClick={handleRequest} disabled={loading}>
      {loading ? 'Sending...' : 'Request Seat'}
    </button>
  )
}
