import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import SearchRides from './pages/SearchRides'
import OfferRide from './pages/OfferRide'
import MyRides from './pages/MyRides'
import RideDetailPage from './pages/RideDetailPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import Login from './pages/Login'
import Register from './pages/Register'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -12 },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.25,
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppLayout({ children }) {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isAuth = location.pathname === '/login' || location.pathname === '/register'

  const content = (
    <AnimatePresence mode="wait">
      <AnimatedPage key={location.pathname}>
        {children}
      </AnimatedPage>
    </AnimatePresence>
  )

  if (isLanding || isAuth) return content

  return (
    <div className="app">
      <Navbar />
      {content}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<AppLayout><InnerRoutes /></AppLayout>} />
    </Routes>
  )
}

function InnerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchRides /></ProtectedRoute>} />
      <Route path="/offer-ride" element={<ProtectedRoute><OfferRide /></ProtectedRoute>} />
      <Route path="/my-rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
      <Route path="/rides/:id" element={<ProtectedRoute><RideDetailPage /></ProtectedRoute>} />
      <Route path="/chat/:rideId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/chats" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    </Routes>
  )
}