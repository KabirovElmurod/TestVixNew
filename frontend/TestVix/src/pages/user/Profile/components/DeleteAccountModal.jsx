import React, { useState } from 'react'
import Modal from './Modal'
import { deleteAccount } from '../../../../api/profile'

export default function DeleteAccountModal({ isOpen, onClose }) {
  const [deleteForm, setDeleteForm] = useState({
    confirmation: '',
    reason: ''
  })
  const [deleteError, setDeleteError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeleteChange = (e) => {
    setDeleteForm({
      ...deleteForm,
      [e.target.name]: e.target.value
    })
    setDeleteError('')
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    setLoading(true)

    if (deleteForm.confirmation !== 'DELETE') {
      setDeleteError('Iltimos, "DELETE" so\'zini to\'g\'ri kiriting')
      setLoading(false)
      return
    }

    try {
      const response = await deleteAccount(deleteForm.confirmation, deleteForm.reason)

      if (response.status) {
        // Success - logout va redirect
        onClose()
        alert('Hisob muvaffaqiyatli o\'chirildi')
        window.location.href = '/'
      } else {
        setDeleteError(response.message || 'Hisobni o\'chirishda xatolik yuz berdi')
      }
    } catch (error) {
      setDeleteError('Hisobni o\'chirishda xatolik yuz berdi')
      console.error('Error deleting account:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hisobni o'chirish">
      <div className="delete-account-form">
        <div className="delete-warning">
          <i className="bi bi-exclamation-triangle"></i>
          <h4>Diqqat!</h4>
          <p>Hisobni o'chirgandan so'ng barcha ma'lumotlaringiz qaytarib bo'lmaydigan tarzda o'chiriladi.</p>
        </div>
        {deleteError && (
          <div className="form-error">{deleteError}</div>
        )}
        <div className="form-group">
          <label>Tasdiqlash uchun "DELETE" so'zini kiriting</label>
          <input
            type="text"
            name="confirmation"
            value={deleteForm.confirmation}
            onChange={handleDeleteChange}
            className="form-input"
            placeholder="DELETE"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>O'chirish sababi (ixtiyoriy)</label>
          <textarea
            name="reason"
            value={deleteForm.reason}
            onChange={handleDeleteChange}
            className="form-textarea"
            rows={3}
            placeholder="Nega hisobni o'chirmoqchisiz?"
            disabled={loading}
          />
        </div>
        <div className="form-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Bekor qilish
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? 'O\'chirilmoqda...' : 'Hisobni o\'chirish'}
          </button>
        </div>
      </div>
    </Modal>
  )
}