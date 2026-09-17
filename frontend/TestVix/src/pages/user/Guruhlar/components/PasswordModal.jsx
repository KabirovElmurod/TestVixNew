import React, { useState } from 'react'

export default function PasswordModal({ isOpen, room, onClose, onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !room) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === room.password) {
      onSuccess(room)
      setPassword('')
      setError('')
    } else {
      setError('Noto\'g\'ri parol')
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
              <h4>{room.name}</h4>
              <p>{room.test.nom}</p>
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
              />
              {error && <span className="error-text">{error}</span>}
            </div>
            
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleClose}>
                Bekor qilish
              </button>
              <button type="submit" className="submit-btn">
                Kirish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
