import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function WaitingRoom({ room, onStartTest, onLeave }) {
  const [countdown, setCountdown] = useState(30)
  const [participants, setParticipants] = useState(room.members)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleStartNow = () => {
    if (onStartTest) {
      onStartTest()
    } else {
      // Navigate to StartTest page
      const testId = room.test.test_id || 'test_001'
      const hashUrl = room.test.test_key || 'hash_123'
      const id = room.test.id || 1
      navigate(`/test/start/${id}/${testId}/${hashUrl}`)
    }
  }

  return (
    <div className="waiting-room-container">
      {/* Header */}
      <div className="waiting-header">
        <button className="back-button" onClick={onLeave}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="header-title-section">
          <h1 className="room-title">{room.name}</h1>
          <p className="room-subtitle">Test boshlanishiga tayyorlanmoqda</p>
        </div>
        <button className="exit-button" onClick={onLeave}>
          Chiqish
        </button>
      </div>

      {/* Main Content */}
      <div className="waiting-content">
        {/* Countdown Card */}
        <div className="countdown-card">
          <div className="countdown-circle">
            <div className="countdown-number">{countdown}</div>
            <div className="countdown-label">soniya</div>
          </div>
          <h2 className="countdown-title">Test tez orada boshlanadi</h2>
          <p className="countdown-subtitle">
            Barcha ishtirokchilar tayyor bo'lganda test avtomatik boshlanadi
          </p>
        </div>

        {/* Participants Grid */}
        <div className="participants-section">
          <div className="section-header">
            <h3>Ishtirokchilar ({participants.length}/{room.max_members || 10})</h3>
            <span className="ready-count">
              {participants.filter(p => p.ready).length} tayyor
            </span>
          </div>
          <div className="participants-grid">
            {participants.map((participant, index) => (
              <div key={participant.id} className={`participant-card ${participant.ready ? 'ready' : 'waiting'}`}>
                <div className="participant-avatar">
                  {participant.nickname.charAt(0).toUpperCase()}
                  {participant.ready && (
                    <div className="ready-indicator">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                  )}
                </div>
                <div className="participant-info">
                  <span className="participant-name">{participant.nickname}</span>
                  <span className="participant-status">
                    {participant.ready ? 'Tayyor' : 'Kutmoqda'}
                  </span>
                </div>
                {participant.id === room.creator.id && (
                  <span className="owner-badge">Owner</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test Info Summary */}
        <div className="test-summary-card">
          <div className="summary-header">
            <i className="bi bi-info-circle"></i>
            <h3>Test haqida</h3>
          </div>
          <div className="summary-content">
            <div className="summary-item">
              <span className="label">Fan:</span>
              <span className="value">{room.test.fan}</span>
            </div>
            <div className="summary-item">
              <span className="label">Nomi:</span>
              <span className="value">{room.test.nom}</span>
            </div>
            <div className="summary-item">
              <span className="label">Vaqt:</span>
              <span className="value">{room.test.istime ? `${room.test.time} daqiqa` : 'Cheksiz'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {room.creator.id === 5 && (
            <button className="start-now-button" onClick={handleStartNow}>
              <i className="bi bi-play-fill"></i>
              Hozir boshlash
            </button>
          )}
          <button className="cancel-button" onClick={onLeave}>
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  )
}
