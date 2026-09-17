import React, { useState, useEffect } from 'react'

export default function EditGroupModal({ isOpen, group, onClose, onSuccess }) {
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (group) {
      setGroupName(group.name)
      setDescription(group.description)
    }
  }, [group])

  if (!isOpen || !group) return null

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

    setError('')
    onSuccess()
  }

  const handleClose = () => {
    setGroupName(group.name)
    setDescription(group.description)
    setError('')
    onClose()
  }

  const handleDeleteGroup = () => {
    if (confirm('Guruhni o\'chirishni tasdiqlaysizmi?')) {
      // Delete logic here
      onSuccess()
    }
  }

  return (
    <div className="group-modal-overlay" onClick={handleClose}>
      <div className="group-modal edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Guruhni tahrirlash</h3>
          <button className="close-btn" onClick={handleClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <i className="bi bi-info-circle"></i>
            Ma'lumot
          </button>
          <button 
            className={`modal-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <i className="bi bi-people"></i>
            A'zolar
          </button>
          <button 
            className={`modal-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="bi bi-gear"></i>
            Sozlamalar
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'info' && (
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
                <span>Guruh ID: {group.id}</span>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleClose}>
                  Bekor qilish
                </button>
                <button type="submit" className="submit-btn">
                  <i className="bi bi-check-lg"></i>
                  Saqlash
                </button>
              </div>
            </form>
          )}

          {activeTab === 'members' && (
            <div className="members-tab-content">
              <div className="members-header">
                <h4>A'zolar ({group.members})</h4>
                <button className="add-member-btn">
                  <i className="bi bi-person-plus"></i>
                  Qo'shish
                </button>
              </div>
              
              <div className="members-list">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="member-row">
                    <div className="member-avatar">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div className="member-details">
                      <div className="member-name">Foydalanuvchi {i}</div>
                      <div className="member-username">@user{i}</div>
                    </div>
                    <div className="member-actions">
                      {i === 1 && (
                        <span className="owner-badge">Egasi</span>
                      )}
                      <button className="member-action-btn remove">
                        <i className="bi bi-person-dash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleClose}>
                  Yopish
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab-content">
              <div className="settings-section">
                <h4>Xavfsizlik</h4>
                <div className="setting-item">
                  <label className="setting-label">
                    <input type="checkbox" />
                    <span>Faqat taklif qilingan a'zolar qo'shilsin</span>
                  </label>
                </div>
                <div className="setting-item">
                  <label className="setting-label">
                    <input type="checkbox" defaultChecked />
                    <span>Testlarni faqat adminlar ulashishi mumkin</span>
                  </label>
                </div>
              </div>

              <div className="settings-section danger">
                <h4>Xavfli zonalar</h4>
                <button className="danger-btn" onClick={handleDeleteGroup}>
                  <i className="bi bi-trash"></i>
                  Guruhni o'chirish
                </button>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleClose}>
                  Yopish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
