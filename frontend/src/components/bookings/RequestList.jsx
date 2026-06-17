import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'

export default function RequestList({ requests, ride, onUpdate }) {
  const [loading, setLoading] = useState(null)

  const respond = async (requestId, status) => {
    setLoading(requestId)

    try {
      await api.patch(`/api/requests/${requestId}?status=${status}`)
    } catch (err) {
      setLoading(null)
      return toast.error(err.message)
    }
    setLoading(null)

    toast.success(status === 'accepted' ? 'Passenger accepted!' : 'Request rejected.')
    onUpdate?.()
  }

  const pending = requests?.filter((r) => r.status === 'pending') || []
  const resolved = requests?.filter((r) => r.status !== 'pending') || []
  const canAccept = ride.available_seats > 0

  if (!requests?.length) {
    return (
      <motion.p
        className="empty-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        No requests yet.
      </motion.p>
    )
  }

  return (
    <div className="request-list">
      {pending.length > 0 && (
        <>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Pending Requests ({pending.length})
          </motion.h3>
          <AnimatePresence>
            {pending.map((req) => (
              <motion.div
                key={req.id}
                className="request-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <div className="request-info">
                  <strong>{req.passenger_name}</strong>
                  <span>{req.passenger_phone}</span>
                </div>
                <div className="request-actions">
                  <motion.button
                    className="btn-sm btn-success"
                    onClick={() => respond(req.id, 'accepted')}
                    disabled={loading === req.id || !canAccept}
                    title={!canAccept ? 'No seats available' : 'Accept'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading === req.id ? '...' : 'Accept'}
                  </motion.button>
                  <motion.button
                    className="btn-sm btn-danger"
                    onClick={() => respond(req.id, 'rejected')}
                    disabled={loading === req.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading === req.id ? '...' : 'Reject'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}

      {resolved.length > 0 && (
        <>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Resolved
          </motion.h3>
          <AnimatePresence>
            {resolved.map((req) => (
              <motion.div
                key={req.id}
                className={`request-card resolved-${req.status}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="request-info">
                  <strong>{req.passenger_name}</strong>
                  <span>{req.status}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
