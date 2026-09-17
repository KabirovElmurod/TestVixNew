import React, { useState } from 'react'
// import '../../../style/block/user/page/guruhlar'
import RoomCard from './components/RoomCard'
import RoomDetail from './components/RoomDetail'
import WaitingRoom from './components/WaitingRoom'
import PasswordModal from './components/PasswordModal'
import GroupList from './components/GroupList'

export default function Guruhlar() {
  const [currentPage, setCurrentPage] = useState('rooms') // 'group' or 'rooms'
  const [currentRoom, setCurrentRoom] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setCurrentRoom(null)
    setShowWaitingRoom(false)
  }

  const handleRoomClick = (room) => {
    if (room.has_password) {
      setSelectedRoom(room)
      setShowPasswordModal(true)
    } else {
      setCurrentRoom(room)
    }
  }

  const handlePasswordSuccess = (room) => {
    setCurrentRoom(room)
    setShowPasswordModal(false)
    setSelectedRoom(null)
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setShowWaitingRoom(false)
    setCurrentPage('rooms')
  }

  const handleStartTest = () => {
    setShowWaitingRoom(true)
  }

  const handleStartFromWaiting = () => {
    // This will be handled by the WaitingRoom component itself
    setShowWaitingRoom(false)
  }

  return (
    <div className="guruhlar-container">
      {/* Navigatio//n */}
      {/* <div className="guruhlar-nav">
        <button
          className={`nav-item ${currentPage === 'group' ? 'active' : ''}`}
          onClick={() => handlePageChange('group')}
        >
          <span className="nav-icon">👥</span>
          <span>Group</span>
          <span className="nav-badge">3</span>
        </button>
        <button
          className={`nav-item ${currentPage === 'rooms' ? 'active' : ''}`}
          onClick={() => handlePageChange('rooms')}
        >
          <span className="nav-icon">⚡</span>
          <span>TestRoom</span>
        </button>
      </div> */}

      {/* Page Content */}
      <div className="guruhlar-content">
        {showWaitingRoom && currentRoom ? (
          <WaitingRoom
            room={currentRoom}
            onStartTest={handleStartFromWaiting}
            onLeave={handleLeaveRoom}
          />
        ) : currentRoom ? (
          <RoomDetail room={currentRoom} onLeave={handleLeaveRoom} onStartTest={handleStartTest} />
        ) : currentPage === 'group' ? (
          <GroupList />
        ) : (
          <RoomCard onRoomClick={handleRoomClick} />
        )}
      </div>
      {/* <RoomCard onRoomClick={handleRoomClick} />
      <RoomDetail room={currentRoom} onLeave={handleLeaveRoom} onStartTest={handleStartTest} /> */}


      <PasswordModal
        isOpen={showPasswordModal}
        room={selectedRoom}
        onClose={() => {
          setShowPasswordModal(false)
          setSelectedRoom(null)
        }}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  )
}
