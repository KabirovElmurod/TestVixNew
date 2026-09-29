import React, { useState } from 'react'
import { joinTestRoom } from '../../../../api/request_testlar'

export default function PasswordModal({ isOpen, room, onClose, onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !room) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await joinTestRoom({
        room_id: room.id,
        password: password
      })

      if (response.status) {
        onSuccess(response.room)
        setPassword('')
        setError('')
      } else {
        setError(response.message || 'Noto\'g\'ri parol')
      }
    } catch (error) {
      setError('Server bilan bog\'lanishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  return (
    <div className="password-modal-overlay" onClick={handleClose}>
      <div className="password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Xonaga kirish</h3>
          <button className="close-btn" onClick={handleClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="room-info-preview">
            <i className="bi bi-lock-fill"></i>
            <div>
              <h4>{room.nom}</h4>
              <p>{room.tavsif || 'Tavsif yo\'q'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolni kiriting"
                className="password-input"
                disabled={loading}
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleClose} disabled={loading}>
                Bekor qilish
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Tekshirilmoqda...' : 'Kirish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
