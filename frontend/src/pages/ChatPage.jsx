import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import ChatWindow from '../components/chat/ChatWindow'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function ChatPage() {
  const { rideId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(rideId || null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const data = await api.get('/api/chat/conversations/list')
      setConversations(data || [])
      if (!selectedId && data?.length > 0) {
        setSelectedId(data[0].ride_id || data[0].id)
      }
    } catch {
      // silent
    }
    setLoading(false)
  }

  const filteredConvs = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (conv.name || conv.driver_name || '').toLowerCase().includes(q)
  })

  const selectedConv = conversations.find(
    (c) => (c.ride_id || c.id) === selectedId
  )

  return (
    <div className="chat-page-layout">
      {/* Conversations Sidebar */}
      <motion.aside
        className="chat-conversations-sidebar"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="conv-search-wrap">
          <span className="material-symbols-outlined conv-search-icon">search</span>
          <input
            type="text"
            placeholder="Search conversations"
            className="conv-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conv-list">
          {loading ? (
            <div className="loading" style={{ padding: 24 }}>
              <div className="spinner" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="empty-text" style={{ padding: 24 }}>
              {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
            </div>
          ) : (
            <AnimatePresence>
              {filteredConvs.map((conv, i) => {
                const convId = conv.ride_id || conv.id
                const isActive = convId === selectedId
                const convName = conv.name || conv.driver_name || 'Unknown'
                const isOnline = conv.status === 'active' || conv.status === 'driving'

                return (
                  <motion.div
                    key={convId}
                    className={`conv-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedId(convId)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ backgroundColor: 'var(--surface-container-low)' }}
                  >
                    <div className="conv-avatar-wrap">
                      <div className={`conv-avatar ${isOnline ? 'online' : 'offline'}`}>
                        {getInitials(convName)}
                      </div>
                      {isOnline && <div className="conv-active-dot" />}
                    </div>
                    <div className="conv-content">
                      <div className="conv-top-row">
                        <h3 className="conv-name">{convName}</h3>
                        <span className="conv-time">{conv.last_message_time ? '2m ago' : ''}</span>
                      </div>
                      {conv.status_text && (
                        <p className="conv-status">{conv.status_text}</p>
                      )}
                      <p className="conv-preview">{conv.last_message || ''}</p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.aside>

      {/* Chat Window */}
      <section className="chat-main-area">
        {selectedId ? (
          <ChatWindow
            key={selectedId}
            rideId={selectedId}
            conversation={selectedConv}
          />
        ) : (
          <div className="chat-empty-state">
            <span className="material-symbols-outlined chat-empty-icon">chat_bubble</span>
            <h2>Secure Messaging</h2>
            <p>Tap a conversation to start chatting with your captain.</p>
          </div>
        )}
      </section>
    </div>
  )
}
