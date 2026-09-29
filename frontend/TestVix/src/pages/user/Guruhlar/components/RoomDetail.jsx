import React, { useState, useRef, useEffect, useContext } from 'react'
import { useWebSocket } from '../../../../context/WebSocketContext'
import { getRoomMessages } from '../../../../api/request_comment'
import { AuthContext } from '../../../../context/AuthContext'

export default function RoomDetail({ room, onLeave, onStartTest }) {
  let { role } = useContext(AuthContext);
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  // const { token } = React.useContext(AuthContext)
  const { connect, disconnect, sendMessage, isConnected, roomUsers, wsMessages } = useWebSocket()

  useEffect(() => {
    // WebSocket ga ulanish
    if (room && room.id) {
      connect(room.id)

      // Chat tarixini olish
      const fetchMessages = async () => {
        try {
          const response = await getRoomMessages(room.id)
          if (response.status) {
            setMessages(response.messages)
          }
        } catch (error) {
          console.error('Xabarlarni yuklashda xatolik:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchMessages()
    }

    return () => {
      disconnect()
    }
  }, [])

  // WebSocket'dan kelgan xabarlarni qo'shish
  useEffect(() => {
    if (wsMessages && wsMessages.length > 0) {
      console.log('message=>', wsMessages);

      setMessages(wsMessages)
    }
  }, [wsMessages])

  const handleStartTestClick = () => {
    if (onStartTest) {
      onStartTest()
    } else {
      alert('Testni boshlash funksiyasi hozircha ishlamaydi')
    }
  }

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput.trim())
      setMessageInput('')
    }
  }

  const handleMessageKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="room-page active">
      {/* Room Hero */}
      <div className="room-hero">
        <div className="room-hero-content">
          <div className="room-label">
            ⚡ TESTROOM · {room.is_active ? 'OCHIQ ROOM' : 'YOPILGAN'}
          </div>
          <h2>{room.nom}</h2>
          <p>
            {room.tavsif || 'Birgalikda test ishlash va natijalarni solishtirish'}
          </p>
          <div className="room-hero-bottom">
            <div className="room-owner">
              <div className="hero-avatar">
                {room.user_id ? room.user_id.toString().charAt(0) : 'U'}
              </div>
              <div>
                Room egasi: <strong>User #{room.user_id}</strong>
              </div>
            </div>
            <button className="leave-btn" onClick={onLeave}>
              Chiqish
            </button>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="room-grid">
        {/* Chat */}
        <div className="room-card chat-card-improved">
          <div className="room-card-title">
            <h3>Room chat</h3>
            <span className="count">{roomUsers.length} a'zo</span>
          </div>
          <div className="messages-container">
            {loading ? (
              <div className="loading-message">Xabarlarni yuklash...</div>
            ) : messages.length === 0 ? (
              <div className="empty-message">Hozircha xabarlar yo'q</div>
            ) : (
              messages.map((msg, index) => (
                <div key={msg.id || index} className={`message-wrapper ${msg.user_id === role.id ? 'own-message' : ''}`}>
                  <div className="message-header">
                    <div className="message-avatar">
                      {msg.username ? msg.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="message-meta">
                      <span className="message-author">{msg.username || `User #${msg.user_id}`}</span>
                      <span className="message-time">{msg.created ? new Date(msg.created).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : 'Hozir'}</span>
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="message-text">{msg.text}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-improved">
            <textarea
              className="message-textarea"
              placeholder="Xabar yozing..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleMessageKeyDown}
              rows={1}
            />
            <button
              className="send-btn-improved"
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
            >
              <i className="bi bi-send-fill"></i>
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside>
          {/* Test Info */}
          <div className="room-card">
            <div className="room-card-title">
              <h3>Test haqida</h3>
            </div>
            <div className="room-card-body">
              <div className="room-test">
                <div className="room-test-subject">
                  TEST ID: {room.test_id}
                </div>
                <h4>
                  Test # {room.test_id}
                </h4>
                <p>
                  Test ID: {room.test_id}
                </p>
                <div className="room-test-meta">
                  <div className="meta-box">
                    <small>Chat</small>
                    <strong>{room.is_message ? 'Yoqilgan' : 'Yoqilmagan'}</strong>
                  </div>
                  <div className="meta-box">
                    <small>Parol</small>
                    <strong>{room.is_password ? 'Bor' : 'Yo\'q'}</strong>
                  </div>
                  <div className="meta-box">
                    <small>Yaratilgan</small>
                    <strong>{new Date(room.created).toLocaleDateString()}</strong>
                  </div>
                </div>
                <button
                  className="start-test-btn"
                  onClick={handleStartTestClick}
                >
                  ▶ Testni boshlash
                </button>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="room-card members">
            <div className="room-card-title">
              <h3>A'zolar</h3>
              <span className="count">
                {roomUsers.length}
              </span>
            </div>
            <div className="room-card-body">
              {roomUsers.map((member, index) => (
                <div key={member.user_id || index} className="member">
                  <div className="member-avatar">
                    {member.username ? member.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="member-name">
                      {member.username || `User #${member.user_id}`}
                    </div>
                    <div className="member-role">
                      {member.user_id === room.user_id ? 'Room yaratuvchisi' : 'Ishtirokchi'}
                    </div>
                  </div>
                  {member.user_id === room.user_id && (
                    <span className="owner-tag">
                      EGASI
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
