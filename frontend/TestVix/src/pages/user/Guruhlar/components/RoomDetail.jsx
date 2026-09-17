import React, { useState, useRef, useEffect } from 'react'

const staticMessages = [
  {
    id: 1,
    user: { username: 'ali_student', nickname: 'Ali Student', avatar: 'AS' },
    text: 'Hammaga omad! Testni boshlashga tayyormizmi?',
    time: '14:35',
    isOwn: false
  },
  {
    id: 2,
    user: { username: 'madina', nickname: 'Madina', avatar: 'MD' },
    text: 'Ha, tayyormiz!',
    time: '14:36',
    isOwn: false
  },
  {
    id: 3,
    user: { username: 'student1', nickname: 'Siz', avatar: 'S' },
    text: 'Bu test qiyin bo\'ladi deb o\'ylayman',
    time: '14:40',
    isOwn: false
  },
  {
    id: 4,
    user: { username: 'student1', nickname: 'Siz', avatar: 'S' },
    text: 'Men ham tayyorman! Keling boshlaymiz',
    time: '14:42',
    isOwn: true
  }
]

export default function RoomDetail({ room, onLeave, onStartTest }) {
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState(staticMessages)
  const messagesEndRef = useRef(null)
  const currentUser = { id: 5, username: 'student1', nickname: 'Siz', avatar: 'S' }

  const handleStartTestClick = () => {
    if (onStartTest) {
      onStartTest()
    } else {
      alert('Testni boshlash funksiyasi hozircha ishlamaydi')
    }
  }

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: Date.now(),
        user: currentUser,
        text: messageInput.trim(),
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      }

      setMessages(prev => [...prev, newMessage])
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
            ⚡ TESTROOM · OCHIQ ROOM
          </div>
          <h2>TestRooms</h2>
          <p>
            Birgalikda test ishlash va natijalarni solishtirish
          </p>
          <div className="room-hero-bottom">
            <div className="room-owner">
              <div className="hero-avatar">
                {room.creator.nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                Room egasi: <strong>{room.creator.nickname}</strong>
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
            <span className="count">{room.members.length} a'zo</span>
          </div>
          <div className="messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.isOwn ? 'own-message' : ''}`}>
                <div className="message-header">
                  <div className="message-avatar">
                    {msg.user.avatar || msg.user.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div className="message-meta">
                    <span className="message-author">{msg.user.nickname}</span>
                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                </div>
              </div>
            ))}
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
                  {room.test.fan.toUpperCase()}
                </div>
                <h4>
                  {room.test.nom}
                </h4>
                <p>
                  {room.test.tavsif}
                </p>
                <div className="room-test-meta">
                  <div className="meta-box">
                    <small>Fan</small>
                    <strong>{room.test.fan}</strong>
                  </div>
                  <div className="meta-box">
                    <small>Vaqt</small>
                    <strong>{room.test.istime ? `${room.test.time} min` : 'Cheksiz'}</strong>
                  </div>
                  <div className="meta-box">
                    <small>Test ID</small>
                    <strong>{room.test.test_id}</strong>
                  </div>
                  <div className="meta-box">
                    <small>Vaqtli</small>
                    <strong>{room.test.istime ? 'Ha' : 'Yo\'q'}</strong>
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
                {room.members.length} / 10
              </span>
            </div>
            <div className="room-card-body">
              {room.members.map((member, index) => (
                <div key={member.id} className="member">
                  <div className="member-avatar">
                    {member.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="member-name">
                      {member.nickname}
                    </div>
                    <div className="member-role">
                      {member.id === room.creator.id ? 'Room yaratuvchisi' : 'Ishtirokchi'}
                    </div>
                  </div>
                  {member.id === room.creator.id && (
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
