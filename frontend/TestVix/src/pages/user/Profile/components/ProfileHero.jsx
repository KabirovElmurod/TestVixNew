import React from 'react'

export default function ProfileHero({ user, onEditProfile, onAvatarClick }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Noma\'lum'
    const date = new Date(dateString)
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  console.log('ProfileHero user:', user)
  console.log('ProfileHero avatar:', user?.avatar)

  return (
    <div className="profile-hero">
      <div className="profile-avatar-section">
        <div className="profile-avatar" onClick={onAvatarClick}>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" onError={(e) => {
              console.error('Avatar load error:', e)
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }} />
          ) : null}
          <div className="avatar-placeholder" style={{ display: user?.avatar ? 'none' : 'flex' }}>
            <span>{user?.nickname?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <button className="avatar-edit-btn">
            <i className="bi bi-camera"></i>
          </button>
        </div>
        <div className="profile-info-header">
          <h1 className="profile-name">{user?.nickname || user?.username}</h1>
          <p className="profile-bio">{user?.bio || 'Bio yo\'q'}</p>
          <div className="profile-meta">
            <span className="meta-item">
              <i className="bi bi-calendar"></i>
              {formatDate(user?.created_at)}dan beri
            </span>
            <span className={`meta-item status ${user?.is_active ? 'active' : 'inactive'}`}>
              <i className={`bi ${user?.is_active ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
              {user?.is_active ? 'Faol' : 'Nofaol'}
            </span>
            {user?.is_admin && (
              <span className="meta-item admin">
                <i className="bi bi-shield-check"></i>
                Admin
              </span>
            )}
          </div>
        </div>
      </div>
      <button className="edit-profile-btn" onClick={onEditProfile}>
        <i className="bi bi-pencil"></i>
        Profilni tahrirlash
      </button>
    </div>
  )
}