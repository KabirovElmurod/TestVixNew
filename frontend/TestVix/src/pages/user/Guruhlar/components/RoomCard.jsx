import React from 'react'

const staticTests = [
  {
    id: 1,
    nom: 'Matematika asoslari',
    fan: 'Matematika',
    tavsif: 'Matematikaning asosiy kontsepsiyalari va formulalari bo\'yicha test',
    test_id: 'math_001',
    test_code: 'MATH-2024-001',
    test_key: 'key_math_001',
    ispublic: true,
    istime: true,
    time: 30,
    created: '2024-01-15T10:30:00',
    user: { id: 1, username: 'teacher1', nickname: 'Matematika o\'qituvchisi' }
  },
  {
    id: 2,
    nom: 'Fizika 101',
    fan: 'Fizika',
    tavsif: 'Mexanika va termodinamika bo\'yicha kirish testi',
    test_id: 'phys_002',
    test_code: 'PHYS-2024-002',
    test_key: 'key_phys_002',
    ispublic: false,
    istime: false,
    time: null,
    created: '2024-01-20T14:45:00',
    user: { id: 2, username: 'physics_pro', nickname: 'Fizika mutaxassisi' }
  },
  {
    id: 3,
    nom: 'Kimyo elementlari',
    fan: 'Kimyo',
    tavsif: 'Davriy jadval va kimyoviy elementlar haqida test',
    test_id: 'chem_003',
    test_code: 'CHEM-2024-003',
    test_key: 'key_chem_003',
    ispublic: true,
    istime: true,
    time: 45,
    created: '2024-02-01T09:00:00',
    user: { id: 3, username: 'chem_master', nickname: 'Kimyo o\'qituvchisi' }
  }
]

const staticRooms = [
  {
    id: 1,
    name: 'Matematika tayyorlash',
    test_id: 1,
    test: staticTests[0],
    has_password: false,
    password: null,
    creator: { id: 1, username: 'teacher1', nickname: 'Matematika o\'qituvchisi' },
    members: [
      { id: 1, username: 'teacher1', nickname: 'Matematika o\'qituvchisi', ready: true },
      { id: 5, username: 'student1', nickname: 'Talaba 1', ready: false },
      { id: 6, username: 'student2', nickname: 'Talaba 2', ready: false }
    ],
    max_members: 10,
    is_started: false,
    created: '2024-01-15T11:00:00'
  },
  {
    id: 2,
    name: 'Fizika praktikum',
    test_id: 2,
    test: staticTests[1],
    has_password: true,
    password: 'phys123',
    creator: { id: 2, username: 'physics_pro', nickname: 'Fizika mutaxassisi' },
    members: [
      { id: 2, username: 'physics_pro', nickname: 'Fizika mutaxassisi', ready: true },
      { id: 7, username: 'student3', nickname: 'Talaba 3', ready: false }
    ],
    max_members: 8,
    is_started: false,
    created: '2024-01-20T15:00:00'
  },
  {
    id: 3,
    name: 'Kimyo laboratoriya',
    test_id: 3,
    test: staticTests[2],
    has_password: true,
    password: 'chem456',
    creator: { id: 3, username: 'chem_master', nickname: 'Kimyo o\'qituvchisi' },
    members: [
      { id: 3, username: 'chem_master', nickname: 'Kimyo o\'qituvchisi', ready: true }
    ],
    max_members: 6,
    is_started: true,
    created: '2024-02-01T10:00:00'
  }
]

export default function RoomCard({ onRoomClick }) {
  return (
    <div className="rooms-grid-container">
      {staticRooms.map((room) => (
        <div key={room.id} className={`room-card ${room.is_started ? 'active' : 'pending'}`} onClick={() => onRoomClick(room)}>
          {/* Accent Border */}
          <div className={`room-card-accent ${room.is_started ? 'accent-green' : 'accent-orange'}`}></div>

          {/* Card Content */}
          <div className="room-card-content">
            {/* Header */}
            <div className="room-card-header">
              <div className="room-title-section">
                <h3 className="room-title">{room.name}</h3>
                <span className={`room-status-badge ${room.is_started ? 'status-active' : 'status-pending'}`}>
                  {room.is_started ? 'Faol' : 'Kutilmoqda'}
                </span>
              </div>
              <div className="room-id">ID: {room.id}</div>
            </div>

            {/* Description */}
            <p className="room-description">{room.test.nom}</p>

            {/* Statistics */}
            <div className="room-stats">
              <div className="stat-item">
                <i className="bi bi-people"></i>
                <span>{room.members.length} ishtirokchi</span>
              </div>
              <div className="stat-item">
                <i className="bi bi-chat-dots"></i>
                <span>3 xabar</span>
              </div>
            </div>

            {/* Creator Info */}
            <div className="room-creator">
              <div className="creator-avatar">
                {room.creator.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="creator-info">
                <span className="creator-name">{room.creator.nickname}</span>
                <span className="creator-username">@{room.creator.username}</span>
              </div>
            </div>

            {/* Pending Warning Box */}
            {room.has_password && (
              <div className="room-warning-box">
                <i className="bi bi-lock-fill"></i>
                <span>Parol bilan himoyalangan. Kirish uchun parol kiritishingiz kerak.</span>
              </div>
            )}

            {/* Action Button */}
            <button className="room-join-btn">
              Kirish
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
