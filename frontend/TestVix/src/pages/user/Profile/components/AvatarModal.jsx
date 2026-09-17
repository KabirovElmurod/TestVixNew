import React, { useState, useRef } from 'react'
import Modal from './Modal'
import { uploadAvatar, cacheAvatar, clearAvatarCache } from '../../../../api/profile'

export default function AvatarModal({ isOpen, onClose, currentAvatar, userId }) {
  const [avatarPreview, setAvatarPreview] = useState(currentAvatar || null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // File size validation (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Rasm hajmi 5MB dan oshmasligi kerak')
        return
      }

      // File type validation
      if (!file.type.startsWith('image/')) {
        setError('Faqat rasm fayllarini yuklash mumkin')
        return
      }

      setError('')
      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    setLoading(true)
    setError('')

    try {
      // Upload file to backend
      const response = await uploadAvatar(avatarFile)
      
      if (response.status) {
        // Cache the avatar URL in localStorage
        if (userId && response.avatar_url) {
          cacheAvatar(userId, response.avatar_url)
        }
        
        onClose()
        setAvatarPreview(null)
        setAvatarFile(null)
        
        // Trigger parent refresh
        if (onClose.onSuccess) {
          onClose.onSuccess()
        }
        
        alert('Avatar muvaffaqiyatly yuklandi!')
      } else {
        setError(response.message || 'Rasmni yuklashda xatolik yuz berdi')
      }
    } catch (error) {
      setError('Rasmni yuklashda xatolik yuz berdi')
      console.error('Error uploading avatar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarCancel = () => {
    onClose()
    setAvatarPreview(currentAvatar || null)
    setAvatarFile(null)
    setError('')
  }

  const handleRemoveAvatar = async () => {
    if (!userId) return
    
    try {
      // Upload empty file to remove avatar
      const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' })
      const response = await uploadAvatar(emptyFile)
      
      if (response.status) {
        // Clear cache
        clearAvatarCache(userId)
        
        onClose()
        setAvatarPreview(null)
        setAvatarFile(null)
        
        // Trigger parent refresh
        if (onClose.onSuccess) {
          onClose.onSuccess()
        }
        
        alert('Avatar muvaffaqiyatly olib tashlandi!')
      } else {
        setError(response.message || 'Avatarni olib tashlashda xatolik yuz berdi')
      }
    } catch (error) {
      setError('Avatarni olib tashlashda xatolik yuz berdi')
      console.error('Error removing avatar:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleAvatarCancel} title="Avatarni yuklash">
      <div className="avatar-upload-form">
        {error && (
          <div className="form-error">{error}</div>
        )}
        
        <div className="avatar-preview-container">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className="avatar-preview" />
          ) : (
            <div className="avatar-upload-placeholder">
              <i className="bi bi-cloud-upload"></i>
              <p>Rasmni yuklash uchun tugmani bosing</p>
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        <div className="avatar-info">
          <p className="avatar-note">
            <i className="bi bi-info-circle"></i>
            Rasm fayl shaklida yuklanadi va serverda saqlanadi.
            Maksimal hajm: 5MB. Qo'llab-quvvatlanadigan formatlar: JPG, PNG, GIF
          </p>
        </div>
        
        <div className="form-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleAvatarCancel}
            disabled={loading}
          >
            Bekor qilish
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAvatarClick}
            disabled={loading}
          >
            Rasm tanlash
          </button>
          {avatarPreview && avatarPreview !== currentAvatar && (
            <button 
              className="btn btn-primary" 
              onClick={handleAvatarUpload}
              disabled={loading}
            >
              {loading ? 'Yuklanmoqda...' : 'Yuklash'}
            </button>
          )}
          {currentAvatar && (
            <button 
              className="btn btn-danger" 
              onClick={handleRemoveAvatar}
              disabled={loading}
            >
              Olib tashlash
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}