import React, { useState } from 'react'

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

const staticSharedTests = [
  {
    id: 1,
    test_id: 1,
    test: staticTests[0],
    shared_by: { id: 1, username: 'teacher1', nickname: 'Matematika o\'qituvchisi' },
    shared_at: '2024-01-15T11:00:00'
  },
  {
    id: 2,
    test_id: 3,
    test: staticTests[2],
    shared_by: { id: 3, username: 'chem_master', nickname: 'Kimyo o\'qituvchisi' },
    shared_at: '2024-02-01T10:00:00'
  }
]

export default function GroupDetail({ group, onBack, onEdit }) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)

  const handleShareTest = (test) => {
    setSelectedTest(test)
    setShowShareModal(true)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="group-detail-container">
      <div className="group-detail-header">
        <button className="back-btn" onClick={onBack}>
          <i className="bi bi-arrow-left"></i>
        </button>
        
        <div className="group-header-info">
          <div className="group-avatar-large">
            {group.avatar}
          </div>
          <div>
            <h2>{group.name}</h2>
            <p className="group-meta-info">
              <span><i className="bi bi-people"></i> {group.members} a'zo</span>
              <span><i className="bi bi-book"></i> {group.tests} test</span>
            </p>
          </div>
        </div>

        <button className="edit-group-btn" onClick={onEdit}>
          <i className="bi bi-gear"></i>
          Sozlamalar
        </button>
      </div>

      <div className="group-detail-body">
        <div className="group-detail-main">
          <div className="section-header">
            <h3>Test ulashish</h3>
            <button className="share-test-btn" onClick={() => setShowShareModal(true)}>
              <i className="bi bi-plus-lg"></i>
              Test ulashish
            </button>
          </div>

          <div className="available-tests">
            <h4>Mening testlarim</h4>
            <div className="tests-grid">
              {staticTests.map((test) => (
                <div key={test.id} className="mini-test-card">
                  <div className="mini-test-header">
                    <span className="test-subject">{test.fan}</span>
                    {test.istime && (
                      <span className="test-time">{test.time} daqiqa</span>
                    )}
                  </div>
                  <h5 className="mini-test-name">{test.nom}</h5>
                  <button 
                    className="share-action-btn"
                    onClick={() => handleShareTest(test)}
                  >
                    <i className="bi bi-share"></i>
                    Ulashish
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="shared-tests-section">
            <h4>Ulashilgan testlar</h4>
            <div className="shared-tests-list">
              {staticSharedTests.map((shared) => (
                <div key={shared.id} className="shared-test-item">
                  <div className="shared-test-info">
                    <div className="shared-test-avatar">
                      {shared.test.fan.charAt(0)}
                    </div>
                    <div>
                      <h5>{shared.test.nom}</h5>
                      <p className="shared-by">
                        {shared.shared_by.nickname} tomonidan ulashildi
                      </p>
                    </div>
                  </div>
                  <div className="shared-test-meta">
                    <span className="shared-time">
                      <i className="bi bi-clock"></i>
                      {formatTime(shared.shared_at)}
                    </span>
                    <span className="shared-date">
                      <i className="bi bi-calendar"></i>
                      {formatDate(shared.shared_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="group-detail-sidebar">
          <div className="group-info-card">
            <h4>Guruh haqida</h4>
            <p className="group-desc">{group.description}</p>
            <div className="group-stats">
              <div className="stat-item">
                <span className="stat-value">{group.members}</span>
                <span className="stat-label">A'zolar</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{group.tests}</span>
                <span className="stat-label">Testlar</span>
              </div>
            </div>
          </div>

          <div className="group-members-card">
            <h4>A'zolar</h4>
            <div className="members-preview">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="member-avatar-small">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="member-count">+{group.members - 5}</div>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Testni ulashish</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {selectedTest && (
                <div className="test-preview">
                  <div className="test-preview-header">
                    <span className="test-subject">{selectedTest.fan}</span>
                  </div>
                  <h4>{selectedTest.nom}</h4>
                  <p>{selectedTest.tavsif}</p>
                </div>
              )}
              <div className="share-message">
                <label>Xabar qo'shish (ixtiyoriy)</label>
                <textarea 
                  placeholder="Test haqida izoh yozing..."
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowShareModal(false)}>
                  Bekor qilish
                </button>
                <button className="confirm-btn" onClick={() => setShowShareModal(false)}>
                  <i className="bi bi-send"></i>
                  Ulashish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
