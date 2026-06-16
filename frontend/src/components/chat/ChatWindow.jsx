import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'

export default function ChatWindow({ rideId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const lastIdRef = useRef(null)

  useEffect(() => {
    if (!rideId) return
    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [rideId])

  const loadMessages = async () => {
    try {
      const params = lastIdRef.current ? { after_id: lastIdRef.current } : {}
      const data = await api.get(`/api/chat/${rideId}`, params)
      if (data.length > 0) {
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id))
          const newMsgs = data.filter((m) => !existing.has(m.id))
          return [...prev, ...newMsgs]
        })
        lastIdRef.current = data[data.length - 1].id
      }
    } catch {
      // silent fail on poll
    }
    setLoading(false)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!content.trim()) return
    setSending(true)
    try {
      const msg = await api.post(`/api/chat/${rideId}`, { content: content.trim().slice(0, 500) })
      setMessages((prev) => [...prev, msg])
      lastIdRef.current = msg.id
      setContent('')
    } catch {
      toast.error('Failed to send message.')
    }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (loading) return <div className="chat-loading">Loading messages...</div>

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {!messages.length && <p className="empty-text">No messages yet. Say hello!</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.sender_id === user.id ? 'mine' : 'theirs'}`}>
            <div className="chat-bubble">
              <p className="chat-text">{msg.content}</p>
              <span className="chat-time">
                {format(new Date(msg.created_at), 'h:mm a')}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={500}
        />
        <button className="btn-primary" onClick={send} disabled={sending || !content.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}
