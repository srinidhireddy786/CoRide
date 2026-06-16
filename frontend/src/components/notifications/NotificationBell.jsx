import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const lastIdRef = useRef(null)

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
            newN.forEach((n) => toast(n.title, { icon: '🔔' }))
          }
          return [...newN, ...prev]
        })
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
      <button className="bell-btn" onClick={() => setOpen(!open)}>
        🔔
        {unread > 0 && <span className="bell-badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="bell-dropdown">
          <div className="bell-header">
            <h4>Notifications</h4>
            {unread > 0 && (
              <button className="btn-text" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          <div className="bell-list">
            {!notifications.length && <p className="empty-text">No notifications</p>}
            {notifications.map((n) => (
              <div key={n.id} className={`bell-item ${!n.is_read ? 'unread' : ''}`}>
                <p className="bell-title">{n.title}</p>
                <p className="bell-msg">{n.message}</p>
                <span className="bell-time">{format(new Date(n.created_at), 'MMM d, h:mm a')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
