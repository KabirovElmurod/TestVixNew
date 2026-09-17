import React, { useState } from 'react'
import Modal from './Modal'
import { changePassword } from '../../../../api/profile'

export default function PasswordModal({ isOpen, onClose }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    })
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    setLoading(true)

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Barcha maydonlarni to\'ldiring')
      setLoading(false)
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Yangi parollar mos kelmaydi')
      setLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
      setLoading(false)
      return
    }

    try {
      const response = await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      })

      if (response.status) {
        setPasswordSuccess('Parol muvaffaqiyatli o\'zgartirildi!')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })

        setTimeout(() => {
          onClose()
          setPasswordSuccess('')
        }, 2000)
      } else {
        setPasswordError(response.message || 'Parolni o\'zgartirishda xatolik yuz berdi')
      }
    } catch (error) {
      setPasswordError('Parolni o\'zgartirishda xatolik yuz berdi')
      console.error('Error changing password:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Parolni o'zgartirish">
      <form onSubmit={handlePasswordSubmit} className="password-form">
        {passwordError && (
          <div className="form-error">{passwordError}</div>
        )}
        {passwordSuccess && (
          <div className="form-success">{passwordSuccess}</div>
        )}
        <div className="form-group">
          <label>Hozirgi parol</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            className="form-input"
            placeholder="Hozirgi parolingizni kiriting"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Yangi parol</label>
          <input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            className="form-input"
            placeholder="Yangi parolni kiriting"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Yangi parolni tasdiqlash</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            className="form-input"
            placeholder="Yangi parolni qayta kiriting"
            disabled={loading}
          />
        </div>
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Bekor qilish
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'O\'zgartirilmoqda...' : 'O\'zgartirish'}
          </button>
        </div>
      </form>
    </Modal>
  )
}