import { useParams, useNavigate } from 'react-router-dom'
import ChatWindow from '../components/chat/ChatWindow'

export default function ChatPage() {
  const { rideId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="chat-page">
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
      <h2>Chat</h2>
      <ChatWindow rideId={rideId} />
    </div>
  )
}
