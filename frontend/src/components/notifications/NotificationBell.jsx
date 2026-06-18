import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -8, transformOrigin: 'top right' },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.1 } },
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [shake, setShake] = useState(false)
  const ref = useRef(null)
  const lastIdRef = useRef(null)
  const prevCountRef = useRef(0)

  const unread = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    if (!user) return
    loadNotifications()
    const interval = setInterval(loadNotifications, 10000)
    return () => clearInterval(interval)
  }, [user])

  const loadNotifications = async () => {
    try {
      const params = lastIdRef.current ? { after_id: lastIdRef.current } : {}
      const data = await api.get('/api/notifications', params)
      if (data.length > 0) {
        setNotifications((prev) => {
          const existing = new Set(prev.map((n) => n.id))
          const newN = data.filter((n) => !existing.has(n.id))
          if (newN.length > 0) {
            lastIdRef.current = newN[newN.length - 1].id
            newN.forEach((n) => toast(n.title, { icon: '📬' }))
          }
          return [...newN, ...prev]
        })
        // Shake bell on new notifications
        if (data.length > prevCountRef.current) {
          setShake(true)
          setTimeout(() => setShake(false), 500)
        }
        prevCountRef.current = data.length
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    try {
      await api.post('/api/notifications/read')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch {
      // silent
    }
  }

  return (
    <div className="notification-bell" ref={ref}>
      <motion.button
        className={`bell-btn ${shake ? 'shake' : ''}`}
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>notifications</span>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              className="bell-badge"
              key={unread}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="bell-dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bell-header">
              <h4>Notifications</h4>
              {unread > 0 && (
                <motion.button
                  className="btn-text"
                  onClick={markAllRead}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Mark all read
                </motion.button>
              )}
            </div>

            <div className="bell-list">
              {!notifications.length && <p className="empty-text">No notifications</p>}
              <AnimatePresence initial={false}>
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    className={`bell-item ${!n.is_read ? 'unread' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="bell-title">{n.title}</p>
                    <p className="bell-msg">{n.message}</p>
                    <span className="bell-time">
                      {format(new Date(n.created_at), 'MMM d, h:mm a')}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
