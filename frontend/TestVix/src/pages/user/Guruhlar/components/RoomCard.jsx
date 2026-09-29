import React from 'react'

export default function RoomCard({ rooms, onRoomClick, loading }) {
  if (loading) {
    return (
      <div className="rooms-grid-container">
        <div className="loading-message">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="rooms-grid-container">
        <div className="empty-message">Hozircha testroomlar yo'q</div>
      </div>
    )
  }

  return (
    <div className="rooms-grid-container">
      {rooms.map((room) => (
        <div key={room.id} className={`room-card ${room.is_active ? 'active' : 'pending'}`} >
          {/* Accent Border */}
          <div className={`room-card-accent ${room.is_active ? 'accent-green' : 'accent-orange'}`}></div>

          {/* Card Content */}
          <div className="room-card-content">
            {/* Header */}
            <div className="room-card-header">
              <div className="room-title-section">
                <h3 className="room-title">{room.nom}</h3>
                <span className={`room-status-badge ${room.is_active ? 'status-active' : 'status-pending'}`}>
                  {room.is_active ? 'Faol' : 'Nofaol'}
                </span>
              </div>
              <div className="room-id">ID: {room.id}</div>
            </div>

            {/* Description */}
            <p className="room-description">{room.tavsif || 'Tavsif yo\'q'}</p>

            {/* Statistics */}
            <div className="room-stats">
              <div className="stat-item">
                <i className="bi bi-people"></i>
                <span>Ishtirokchilar</span>
              </div>
              {room.is_message && (
                <div className="stat-item">
                  <i className="bi bi-chat-dots"></i>
                  <span>Chat yoqilgan</span>
                </div>
              )}
            </div>

            {/* Creator Info */}
            <div className="room-creator">
              <div className="creator-avatar">
                {room.user_id ? room.user_id.toString().charAt(0) : 'U'}
              </div>
              <div className="creator-info">
                <span className="creator-name">Yaratuvchi #{room.user_id}</span>
                <span className="creator-username">{new Date(room.created).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Pending Warning Box */}
            {room.is_password && (
              <div className="room-warning-box">
                <i className="bi bi-lock-fill"></i>
                <span>Parol bilan himoyalangan. Kirish uchun parol kiritishingiz kerak.</span>
              </div>
            )}

            {/* Action Button */}
            <button className="room-join-btn" onClick={() => onRoomClick(room)}>
              Kirish
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
