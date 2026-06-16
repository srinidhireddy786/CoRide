import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import SearchRides from './pages/SearchRides'
import MyRides from './pages/MyRides'
import RideDetailPage from './pages/RideDetailPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'

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

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><><Navbar /><Dashboard /></></ProtectedRoute>}
        />
        <Route
          path="/search"
          element={<ProtectedRoute><><Navbar /><SearchRides /></></ProtectedRoute>}
        />
        <Route
          path="/my-rides"
          element={<ProtectedRoute><><Navbar /><MyRides /></></ProtectedRoute>}
        />
        <Route
          path="/rides/:id"
          element={<ProtectedRoute><><Navbar /><RideDetailPage /></></ProtectedRoute>}
        />
        <Route
          path="/chat/:rideId"
          element={<ProtectedRoute><><Navbar /><ChatPage /></></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><><Navbar /><ProfilePage /></></ProtectedRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
