import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

const msgVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
}

const dotVariants = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
  },
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const isLocationMsg = (text) => text?.startsWith('https://www.google.com/maps')

export default function ChatWindow({ rideId, conversation }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sharingLocation, setSharingLocation] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [convName, setConvName] = useState(
    conversation?.name || conversation?.driver_name || ''
  )
  const [driverPhone, setDriverPhone] = useState('')
  const bottomRef = useRef(null)
  const lastIdRef = useRef(null)
  const convStatus = conversation?.status_text || ''

  useEffect(() => {
    if (conversation?.name || conversation?.driver_name) {
      setConvName(conversation.name || conversation.driver_name)
    }
    if (rideId) {
      api.get(`/api/rides/${rideId}`)
        .then((ride) => {
          const name =
            ride?.driver_name ||
            ride?.driver?.name ||
            ride?.passenger_name ||
            ride?.user?.name ||
            ''
          if (name) setConvName(name)
          if (ride?.driver_phone) setDriverPhone(ride.driver_phone)
        })
        .catch(() => {})
    }
  }, [rideId, conversation])

  useEffect(() => {
    if (!rideId) return
    setMessages([])
    setLoading(true)
    lastIdRef.current = null
    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [rideId])

  const loadMessages = async () => {
    try {
      const params = lastIdRef.current ? { after_id: lastIdRef.current } : {}
      const data = await api.get(`/api/chat/${rideId}`, params)
      if (data && data.length > 0) {
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id))
          const newMsgs = data.filter((m) => !existing.has(m.id))
          if (newMsgs.length > 0) {
            lastIdRef.current = data[data.length - 1].id
          }
          return [...prev, ...newMsgs]
        })
      }
    } catch {
      // silent on poll
    }
    setLoading(false)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (messageContent = content) => {
    const payload = (messageContent || content).trim()
    if (!payload) return
    setSending(true)
    try {
      const msg = await api.post(`/api/chat/${rideId}`, { content: payload.slice(0, 500) })
      setMessages((prev) => [...prev, msg])
      lastIdRef.current = msg.id
      if (messageContent === content) setContent('')
    } catch {
      toast.error('Failed to send message.')
    }
    setSending(false)
  }

  const shareLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Could not get your location. Please allow location access.')
      return
    }
    setSharingLocation(true)
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      const { latitude, longitude } = position.coords
      const link = `https://www.google.com/maps?q=${latitude},${longitude}`
      await send(link)
    } catch {
      toast.error('Could not get your location. Please allow location access.')
    } finally {
      setSharingLocation(false)
    }
  }

  const handleCall = () => {
    if (driverPhone) {
      window.location.href = `tel:${driverPhone}`
    } else {
      toast.error('Phone number not available.')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    if (isToday) return `Today, ${time}`
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) + `, ${time}`
  }

  const showTimestamp = (msg, idx) => {
    if (idx === 0) return true
    const prev = messages[idx - 1]
    const currDate = new Date(msg.created_at || Date.now())
    const prevDate = new Date(prev.created_at || Date.now())
    return (currDate - prevDate) > 300000
  }

  if (loading && messages.length === 0) return (
    <div className="chat-loading">
      <span className="spinner" />
      <span style={{ marginLeft: 8 }}>Loading messages...</span>
    </div>
  )

  return (
    <div className="chat-window-full">
      <header className="chat-window-header">
        <div className="chat-header-left">
          <div className="chat-header-avatar">{getInitials(convName)}</div>
          <div>
            <h2 className="chat-header-name">{convName || 'Loading...'}</h2>
            <div className="chat-header-status-row">
              <span className="chat-header-status-dot" />
              <span className="chat-header-status-text">{convStatus || 'Online'}</span>
            </div>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-header-btn" title="Call Driver" onClick={handleCall}>
            <span className="material-symbols-outlined">call</span>
          </button>
        </div>
      </header>

      <div className="chat-messages-area">
        {messages.length === 0 && (
          <div className="empty-text" style={{ textAlign: 'center', padding: 40 }}>
            No messages yet. Say hello!
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <div key={msg.id}>
              {showTimestamp(msg, idx) && (
                <div className="chat-timestamp-sep">
                  <span>{formatTime(msg.created_at)}</span>
                </div>
              )}
              <motion.div
                className={`chat-msg-row ${msg.sender_id === user.id ? 'mine' : 'theirs'}`}
                variants={msgVariants}
                initial="hidden"
                animate="visible"
                layout
              >
                {msg.sender_id !== user.id && (
                  <div className="chat-msg-avatar-sm">{getInitials(convName)}</div>
                )}
                <div className="chat-msg-content">
                  <div className={`chat-msg-bubble ${msg.sender_id === user.id ? 'mine' : 'theirs'}`}>
                    {isLocationMsg(msg.content) ? (
                      <a href={msg.content} target="_blank" rel="noreferrer" className="chat-location-card">
                        <div className="chat-location-map-preview">
                          <span className="material-symbols-outlined chat-location-pin">location_on</span>
                        </div>
                        <div className="chat-location-info">
                          <span className="chat-location-title">Shared Location</span>
                          <span className="chat-location-sub">Tap to open in Google Maps</span>
                        </div>
                        <span className="material-symbols-outlined chat-location-arrow">open_in_new</span>
                      </a>
                    ) : (
                      <p className="chat-msg-text">{msg.content}</p>
                    )}
                  </div>
                  <div className="chat-msg-meta">
                    <span className="chat-msg-time">
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : ''}
                    </span>
                    {msg.sender_id === user.id && (
                      <span className="material-symbols-outlined chat-msg-read">done_all</span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className="chat-typing-indicator"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="typing-dots">
              <motion.span className="typing-dot" variants={dotVariants} animate="animate" />
              <motion.span className="typing-dot" variants={dotVariants} animate="animate" style={{ animationDelay: '0.15s' }} />
              <motion.span className="typing-dot" variants={dotVariants} animate="animate" style={{ animationDelay: '0.3s' }} />
            </div>
            <span className="typing-text">{convName} is typing...</span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <footer className="chat-input-footer">
        <div className="chat-quick-actions">
          <button
            className="quick-action-chip"
            onClick={shareLocation}
            disabled={sharingLocation}
          >
            <span className="material-symbols-outlined">location_on</span>
            {sharingLocation ? 'Getting location...' : 'Share Location'}
          </button>
          <button
            className="quick-action-chip"
            onClick={() => setContent('Please wait for 5 mins, I am on my way!')}
          >
            ⏱ Wait for 5 mins
          </button>
          <button
            className="quick-action-chip"
            onClick={() => setContent('Where are you?')}
          >
            📍 Where are you?
          </button>
        </div>

        <div className="chat-input-row-full">
          <div className="chat-input-wrap">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a secure message..."
              maxLength={500}
              className="chat-text-input"
            />
            <button className="chat-mood-btn">
              <span className="material-symbols-outlined">mood</span>
            </button>
          </div>
          <motion.button
            className="chat-send-btn"
            onClick={() => send()}
            disabled={sending || !content.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </motion.button>
        </div>
      </footer>
    </div>
  )
}