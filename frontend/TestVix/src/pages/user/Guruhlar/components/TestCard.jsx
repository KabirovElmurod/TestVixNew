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
  },
  {
    id: 4,
    nom: 'Biologiya testi',
    fan: 'Biologiya',
    tavsif: 'Tirik organizmlar va ularning tuzilishi bo\'yicha test',
    test_id: 'bio_004',
    test_code: 'BIO-2024-004',
    test_key: 'key_bio_004',
    ispublic: true,
    istime: false,
    time: null,
    created: '2024-02-10T16:20:00',
    user: { id: 4, username: 'bio_expert', nickname: 'Biologiya mutaxassisi' }
  }
]

export default function TestCard() {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="test-cards-grid">
      {staticTests.map((test) => (
        <div key={test.id} className="test-card">
          <div className="test-card-header">
            <div className="test-subject">{test.fan}</div>
            <div className="test-public-badge">
              {test.ispublic ? (
                <span className="badge public">
                  <i className="bi bi-globe"></i> Ochiq
                </span>
              ) : (
                <span className="badge private">
                  <i className="bi bi-lock"></i> Yopiq
                </span>
              )}
            </div>
          </div>
          
          <div className="test-card-body">
            <h3 className="test-name">{test.nom}</h3>
            <p className="test-description">{test.tavsif}</p>
            
            <div className="test-meta">
              <div className="meta-item">
                <i className="bi bi-hash"></i>
                <span>{test.test_code}</span>
              </div>
              {test.istime && (
                <div className="meta-item">
                  <i className="bi bi-clock"></i>
                  <span>{test.time} daqiqa</span>
                </div>
              )}
              <div className="meta-item">
                <i className="bi bi-calendar"></i>
                <span>{formatDate(test.created)}</span>
              </div>
            </div>
          </div>

          <div className="test-card-footer">
            <div className="test-author">
              <div className="author-avatar">
                {test.user.nickname.charAt(0).toUpperCase()}
              </div>
              <span>{test.user.nickname}</span>
            </div>
            <button className="test-action-btn">
              <i className="bi bi-share"></i>
              Ulashish
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
