import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    return (
      <motion.span
        className="badge badge-success"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        You're In
      </motion.span>
    )
  }

  if (existing?.status === 'pending') {
    return (
      <motion.button
        className="btn-secondary"
        onClick={cancelRequest}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? 'Cancelling...' : 'Cancel Request'}
      </motion.button>
    )
  }

  if (existing?.status === 'rejected') {
    return (
      <motion.span
        className="badge badge-error"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Request declined
      </motion.span>
    )
  }

  if (!isOpen) {
    return (
      <motion.span
        className="badge"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {ride.status === 'completed' ? 'Completed' : 'In Progress'}
      </motion.span>
    )
  }

  if (isFull) {
    return (
      <motion.span
        className="badge badge-error"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        Fully Booked
      </motion.span>
    )
  }

  return (
    <motion.button
      className="btn-primary"
      onClick={handleRequest}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
          Sending...
        </span>
      ) : 'Request Seat'}
    </motion.button>
  )
}
