import React from 'react'
import { useSearchCon } from '../../context/SearchContext'

const popularTopics = [
  { label: 'Matematika', value: 1290 },
  { label: 'Fizika', value: 1012 },
  { label: 'Ingliz tili', value: 970 },
  { label: 'Kimyo', value: 850 },
  { label: 'Biologiya', value: 780 },
  { label: 'Tarix', value: 625 },
  { label: 'Geografiya', value: 590 },
  { label: 'Ona tili', value: 540 },
  { label: 'IQ testlar', value: 502 },
  { label: 'Mantiq', value: 470 },
]

export default function HomeUser() {
  const { searchText, setSearchText } = useSearchCon()

  const handleSearchChange = (event) => {
    setSearchText({ text: event.target.value, submit: searchText.submit })
  }

  return (
    <div className="home-user-page">
      <section className="home-user-header">
        <div className="home-user-title-group">
          <h1 className="home-user-title">Salom, test yaratish va natijalarni boshqarish oson</h1>
          <p className="home-user-subtitle">Test qo'shish, saqlangan testlaringizni ko'rish va eng mashhur mavzularni izlash uchun bir joyda to'plangan boshqaruv paneli.</p>
        </div>

        <div className="home-user-actions">
          <button className="btn btn-primary">Test qo'shish</button>
          <button className="btn btn-secondary">Qidirish</button>
        </div>
      </section>

      <section className="home-user-grid">
        <div className="home-user-main">
          <div className="home-user-panel">
            <div className="panel-heading">
              <div>
                <h2>Statistika</h2>
                <p>Bugungi va barcha vaqtlar natijalaringizni tezda ko'rib chiqing.</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Testlarim soni</div>
                <div className="stat-value">32</div>
                <div className="stat-detail">Oxirgi 30 kun ichida</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">O'rtacha natija</div>
                <div className="stat-value">84%</div>
                <div className="stat-detail">Barcha testlar bo'yicha o'rtacha natija</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Saqlangan testlar</div>
                <div className="stat-value">14</div>
                <div className="stat-detail">Tezkor kirish uchun tayyor</div>
              </div>
            </div>
          </div>

          <div className="home-user-panel">
            <div className="panel-heading">
              <div>
                <h2>Boshlanish uchun</h2>
                <p>Tezkor amallar va bloklar orqali ishlar tartibda bo'ladi.</p>
              </div>
              <div className="panel-actions">
                <button className="panel-btn">Saqlangan testlar</button>
                <button className="panel-btn primary">Yangi test qo'shish</button>
              </div>
            </div>

            <div className="blocks-grid">
              <div className="block-card">
                <h3>Ishlangan testlar ro'yhati</h3>
                <div className="block-list">
                  <div className="block-item">
                    <span>Matematika 1</span>
                    <small>12 savol</small>
                  </div>
                  <div className="block-item">
                    <span>Fizika tezkor test</span>
                    <small>8 savol</small>
                  </div>
                  <div className="block-item">
                    <span>Ingliz tili 2</span>
                    <small>20 savol</small>
                  </div>
                </div>
              </div>

              <div className="block-card">
                <h3>Saqlangan testlar</h3>
                <div className="block-list">
                  <div className="block-item">
                    <span>Test reja</span>
                    <small>Sinfga tayyor</small>
                  </div>
                  <div className="block-item">
                    <span>Yozma test</span>
                    <small>Ertaga topshirish</small>
                  </div>
                  <div className="block-item">
                    <span>Amaliy mashqlar</span>
                    <small>Qo'shimcha savollar</small>
                  </div>
                </div>
              </div>

              <div className="block-card">
                <h3>Yana nima qo'shish mumkin?</h3>
                <div className="block-list">
                  <div className="block-item">
                    <span>Test vaqtini sozlash</span>
                    <small>Yangi funksiya</small>
                  </div>
                  <div className="block-item">
                    <span>Natija tahlili</span>
                    <small>Grafiklar bilan</small>
                  </div>
                  <div className="block-item">
                    <span>Top 10 mavzular</span>
                    <small>Ko'p qidirilganlar</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="home-user-panel">
          <div className="panel-heading">
            <div>
              <h2>Top 10 qidirilgan mavzular</h2>
              <p>Eng mashhur 10 ta mavzu bo'yicha o'quvchilar qiziqishlari.</p>
            </div>
          </div>

          <div className="tag-list">
            {popularTopics.map((topic, index) => (
              <div key={topic.label} className="tag-card">
                <span>{index + 1}. {topic.label}</span>
                <small>{topic.value} ta qidiruv</small>
              </div>
            ))}
          </div>

          <div className="panel-heading" style={{ marginTop: '24px' }}>
            <div>
              <h2>Qidiruv</h2>
              <p>Testlarni tez topish uchun pastdagi qidiruv maydonidan foydalaning.</p>
            </div>
          </div>

          <div className="panel-actions" style={{ marginTop: '12px', justifyContent: 'stretch' }}>
            <input
              type="text"
              value={searchText?.text || ''}
              onChange={handleSearchChange}
              placeholder="Mavzuni yoki test nomini yozing..."
              className="search-input"
              style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--input-border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
            />
          </div>
        </aside>
      </section>
    </div>
  )
}
