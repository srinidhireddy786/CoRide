import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import AddVehicle from '../components/vehicles/AddVehicle'
import PublishRide from '../components/rides/PublishRide'
import SearchRides from './SearchRides'

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.15, ease: 'easeOut' },
  }),
}

const sectionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

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
        <motion.div
          className="welcome"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Welcome, {user?.name}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            What would you like to do today?
          </motion.p>
        </motion.div>

        <div className="dashboard-cards">
          <motion.button
            className="dash-card"
            onClick={handleOfferRide}
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="dash-icon"><Car size={40} /></span>
            <h2>Offer a Ride</h2>
            <p>Publish your trip and help someone reach their destination</p>
          </motion.button>

          <motion.button
            className="dash-card"
            onClick={() => setMode('find')}
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="dash-icon"><Search size={40} /></span>
            <h2>Find a Ride</h2>
            <p>Search for rides heading your way</p>
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        className="page-container"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
      >
        <motion.button
          className="btn-back"
          onClick={() => setMode(null)}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>

        {mode === 'offer' && (
          <AddVehicle
            onSaved={() => {
              api.get('/api/vehicles').then((data) => {
                setVehicles(data || [])
                setMode('publish')
              })
            }}
            onSkip={() => setMode(null)}
          />
        )}

        {mode === 'publish' && <PublishRide />}
        {mode === 'find' && <SearchRides />}
      </motion.div>
    </AnimatePresence>
  )
}
