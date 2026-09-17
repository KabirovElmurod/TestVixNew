import React from 'react'

export default function OverviewTab({ user, isEditing, editedUser, onEdit, onCancel, onSave, onChange, onPasswordChange, onDeleteAccount }) {
  return (
    <div className="tab-panel overview-panel">
      <div className="overview-grid">
        {/* Profile Information */}
        <div className="info-card">
          <div className="card-header">
            <h3>Shaxsiy ma'lumotlar</h3>
            {!isEditing && (
              <button className="edit-icon-btn" onClick={onEdit}>
                <i className="bi bi-pencil"></i>
              </button>
            )}
          </div>
          <div className="info-content">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Foydalanuvchi nomi</label>
                  <input
                    type="text"
                    name="username"
                    value={editedUser.username}
                    onChange={onChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email}
                    onChange={onChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Nickname</label>
                  <input
                    type="text"
                    name="nickname"
                    value={editedUser.nickname}
                    onChange={onChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={editedUser.bio}
                    onChange={onChange}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button className="btn btn-secondary" onClick={onCancel}>
                    Bekor qilish
                  </button>
                  <button className="btn btn-primary" onClick={onSave}>
                    Saqlash
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Foydalanuvchi nomi</span>
                  <span className="info-value">{user?.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nickname</span>
                  <span className="info-value">{user?.nickname || 'Yozilmagan'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Bio</span>
                  <span className="info-value">{user?.bio || 'Yozilmagan'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="info-card">
          <div className="card-header">
            <h3>Tezkor amallar</h3>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={onPasswordChange}>
              <div className="action-icon">🔐</div>
              <div className="action-text">
                <div className="action-title">Parolni o'zgartirish</div>
                <div className="action-desc">Xavfsizlikni kuchaytirish</div>
              </div>
              <i className="bi bi-chevron-right"></i>
            </button>
            <button className="quick-action-btn">
              <div className="action-icon">📧</div>
              <div className="action-text">
                <div className="action-title">Emailni tasdiqlash</div>
                <div className="action-desc">Hisobni himoya qilish</div>
              </div>
              <i className="bi bi-chevron-right"></i>
            </button>
            <button className="quick-action-btn">
              <div className="action-icon">🔔</div>
              <div className="action-text">
                <div className="action-title">Bildirishnomalar</div>
                <div className="action-desc">Sozlamalarni boshqarish</div>
              </div>
              <i className="bi bi-chevron-right"></i>
            </button>
            <button className="quick-action-btn danger" onClick={onDeleteAccount}>
              <div className="action-icon">🗑️</div>
              <div className="action-text">
                <div className="action-title">Hisobni o'chirish</div>
                <div className="action-desc">Barcha ma'lumotlarni o'chirish</div>
              </div>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}