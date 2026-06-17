import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import RideCard from '../components/rides/RideCard'

export default function MyRides() {
  const [offered, setOffered] = useState([])
  const [joined, setJoined] = useState([])
  const [tab, setTab] = useState('offered')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/rides/my').then((d) => setOffered(d || [])),
      api.get('/api/requests/my').then((d) => setJoined(d || [])),
    ]).finally(() => setLoading(false))
  }, [])

  const list = tab === 'offered' ? offered : joined
  const counts = { offered: offered.length, joined: joined.length }

  if (loading) return (
    <div className="loading">
      <div className="spinner spinner-lg" />
      <span>Loading rides...</span>
    </div>
  )

  return (
    <div className="my-rides-page">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        My Rides
      </motion.h2>

      <div className="tabs">
        <motion.button
          className={`tab ${tab === 'offered' ? 'active' : ''}`}
          onClick={() => setTab('offered')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Offered ({counts.offered})
        </motion.button>
        <motion.button
          className={`tab ${tab === 'joined' ? 'active' : ''}`}
          onClick={() => setTab('joined')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Joined ({counts.joined})
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className="ride-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {list.length === 0 ? (
            <div className="empty-state">
              <h3>No {tab} rides</h3>
              <p>
                {tab === 'offered'
                  ? 'You haven\'t offered any rides yet.'
                  : 'You haven\'t joined any rides yet.'}
              </p>
            </div>
          ) : (
            list.map((ride, i) => (
              <RideCard key={ride.id} ride={ride} index={i} />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
