import React, { useState } from 'react'

export default function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!groupName.trim()) {
      setError('Guruh nomi kiritilishi shart')
      return
    }

    if (groupName.length < 3) {
      setError('Guruh nomi kamida 3 ta belgidan iborat bo\'lishi kerak')
      return
    }

    // Success - in real app, this would call an API
    setError('')
    setGroupName('')
    setDescription('')
    onSuccess()
  }

  const handleClose = () => {
    setGroupName('')
    setDescription('')
    setError('')
    onClose()
  }

  return (
    <div className="group-modal-overlay" onClick={handleClose}>
      <div className="group-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Yangi guruh yaratish</h3>
          <button className="close-btn" onClick={handleClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Guruh nomi *</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Guruh nomini kiriting"
                className="modal-input"
              />
              {error && <span className="error-text">{error}</span>}
            </div>
            
            <div className="form-group">
              <label>Tavsif</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Guruh haqida qisqacha ma'lumot"
                rows={4}
                className="modal-textarea"
              />
            </div>

            <div className="form-info">
              <i className="bi bi-info-circle"></i>
              <span>Yaratilgandan so'ng guruhga a'zolarni taklif qilishingiz mumkin</span>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleClose}>
                Bekor qilish
              </button>
              <button type="submit" className="submit-btn">
                <i className="bi bi-plus-lg"></i>
                Yaratish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
