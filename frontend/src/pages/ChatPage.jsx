import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ChatWindow from '../components/chat/ChatWindow'

export default function ChatPage() {
  const { rideId } = useParams()
  const navigate = useNavigate()

  return (
    <motion.div
      className="chat-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        className="btn-back"
        onClick={() => navigate(-1)}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back
      </motion.button>
      <h2>Chat</h2>
      <ChatWindow rideId={rideId} />
    </motion.div>
  )
}
