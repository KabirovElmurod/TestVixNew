import React, { useEffect, useState } from 'react'
import { useSearchCon } from '../../context/SearchContext'
import { getUserStats } from '../../api/profile'
import { getTestGet } from '../../api/request_testlar'
import { getUserResults } from '../../api/profile'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const { searchText, setSearchText } = useSearchCon()
  const [stats, setStats] = useState(null)
  const [userTests, setUserTests] = useState([])
  const [recentResults, setRecentResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, testsRes, resultsRes] = await Promise.all([
          getUserStats(),
          getTestGet(),
          getUserResults(0, 5)
        ])

        if (statsRes.status) {
          setStats(statsRes.stats)
        }

        if (Array.isArray(testsRes)) {
          setUserTests(testsRes.slice(0, 3))
        }

        if (resultsRes.status && resultsRes.results) {
          setRecentResults(resultsRes.results.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearchChange = (event) => {
    setSearchText({ text: event.target.value, submit: searchText.submit })
  }

  const handleTopicClick = (topic) => {
    setSearchText({
      'text': topic,
      'submit': 1
    })
  }
  const handleAddTestNav = () => {
    navigate('/add_test')
  }
  const handleTestlarNav = () => {
    navigate('/testlar')
  }
  if (loading) {
    return (
      <div className="home-user-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home-user-page">
      <section className="home-user-header">
        <div className="home-user-title-group">
          <h1 className="home-user-title">Salom, test yaratish va natijalarni boshqarish oson</h1>
          <p className="home-user-subtitle">Test qo'shish, saqlangan testlaringizni ko'rish va eng mashhur mavzularni izlash uchun bir joyda to'plangan boshqaruv paneli.</p>
        </div>

        <div className="home-user-actions">
          <button className="btn btn-primary" onClick={handleAddTestNav}>Test qo'shish</button>
          <button className="btn btn-secondary" onClick={handleTestlarNav}>Testlar</button>
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
                <div className="stat-value">{stats?.test_count || 0}</div>
                <div className="stat-detail">Jami yaratilgan testlar</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">O'rtacha natija</div>
                <div className="stat-value">{stats?.avg_score || 0}%</div>
                <div className="stat-detail">Barcha testlar bo'yicha o'rtacha natija</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Test ishlashlar</div>
                <div className="stat-value">{stats?.result_count || 0}</div>
                <div className="stat-detail">Jami test ishlashlar soni</div>
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
                <button className="panel-btn primary" onClick={handleAddTestNav}>Yangi test qo'shish</button>
              </div>
            </div>

            <div className="blocks-grid">
              <div className="block-card">
                <h3>Mening testlarim</h3>
                <div className="block-list">
                  {userTests.length > 0 ? (
                    userTests.map((test, index) => (
                      <div key={index} className="block-item">
                        <span>{test.nom}</span>
                        <small>{test.savollar_soni || 0} savol</small>
                      </div>
                    ))
                  ) : (
                    <div className="block-item">
                      <span>Hali test yaratilmagan</span>
                      <small>Test qo'shish tugmasini bosing</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="block-card">
                <h3>Oxirgi natijalarim</h3>
                <div className="block-list">
                  {recentResults.length > 0 ? (
                    recentResults.map((result, index) => (
                      <div key={index} className="block-item">
                        <span>Test #{result.test_id}</span>
                        <small>{result.score}% - {result.true_son}/{result.sum_son}</small>
                      </div>
                    ))
                  ) : (
                    <div className="block-item">
                      <span>Hali natija yo'q</span>
                      <small>Test ishlang</small>
                    </div>
                  )}
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
              <div key={topic.label} className="tag-card" onClick={() => handleTopicClick(topic.label)} style={{ cursor: 'pointer' }}>
                <span>{index + 1}. {topic.label}</span>
                <small>{topic.value} ta qidiruv</small>
              </div>
            ))}
          </div>

        </aside>
      </section>
    </div>
  )
}
