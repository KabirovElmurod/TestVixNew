import React, { useState } from 'react'
import Input from './Input'
import TextArea from './TextArea'
import Check from './Check'
import Message from './Message'
import { createTestRoom } from '../../api/request_testlar'

export default function CreateRoomModal({ isOpen, onClose, testId, onSuccess }) {
  const [nom, setNom] = useState('')
  const [tavsif, setTavsif] = useState('')
  const [isMessage, setIsMessage] = useState(true)
  const [isPassword, setIsPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nom.trim()) {
      setMessage('Room nomi kiritilishi shart')
      setMessageType('error')
      return
    }

    if (isPassword && !password.trim()) {
      setMessage('Parol kiritilishi shart')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      let datas = {
        test_id: testId,
        nom: nom,
        tavsif: tavsif,
        is_message: isMessage,
        is_password: isPassword,
        password: isPassword ? password : null
      }
      const data = await createTestRoom(datas)


      if (data.status) {
        setMessage('Testroom muvaffaqiyatli yaratildi!')
        setMessageType('success')
        setTimeout(() => {
          onClose()
          onSuccess(data.room_id)
        }, 1500)
      } else {
        setMessage(data.message || 'Xatolik yuz berdi')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Server bilan bog\'lanishda xatolik')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNom('')
    setTavsif('')
    setIsMessage(true)
    setIsPassword(false)
    setPassword('')
    setMessage('')
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content create-room-modal">
        <div className="modal-header">
          <h2>Testroom yaratish</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <Message
          type={messageType}
          message={message}
          onClose={() => setMessage('')}
          duration={4000}
        />

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <Input
              place="Room nomi"
              label="Room nomi"
              setNom={setNom}
              nom={nom}
            />

            <TextArea
              place="Tavsif"
              label="Tavsif"
              setNom={setTavsif}
              nom={tavsif}
            />

            <Check
              set={setIsMessage}
              item={isMessage}
              theme="Chat yoqish/o'chirish"
              name="is_message"
              label1="Yoq"
              label2="Yoq"
              id1="message_off_id"
              id2="message_on_id"
              comment1="Chat yoqilmaydi"
              comment2="Chat yoqiladi"
            />

            <Check
              set={setIsPassword}
              item={isPassword}
              theme='Parol bilan himoyalash'
              name="is_password"
              label1="Kodsiz"
              label2="Kodli"
              id1="password_off_id"
              id2="password_on_id"
              comment1="Hamma kirishi mumkin"
              comment2="Faqat kod bilan kirish mumkin"
            />

            {isPassword && (
              <Input
                place="Parol"
                label="Parol"
                setNom={setPassword}
                nom={password}
              />
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Yaratilmoqda...' : 'Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}