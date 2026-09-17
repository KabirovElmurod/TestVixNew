import React, { useState } from 'react'

const staticGroups = [
  {
    id: 1,
    name: 'Matematika 11-A',
    memberCount: 24,
    color: 'linear-gradient(135deg, #635bff, #887fff)',
    initial: 'M'
  },
  {
    id: 2,
    name: 'Fizika Abituriyent',
    memberCount: 18,
    color: 'linear-gradient(135deg, #0ea5a4, #22c55e)',
    initial: 'F'
  },
  {
    id: 3,
    name: 'Ingliz tili B2',
    memberCount: 32,
    color: 'linear-gradient(135deg, #f97316, #fb7185)',
    initial: 'I'
  }
]

const staticTests = [
  {
    id: 1,
    subject: '📐 MATEMATIKA',
    title: 'Algebra — Yakuniy nazorat testi',
    description: 'Algebraik ifodalar, tenglamalar va funksiyalar bo\'yicha yakuniy nazorat.',
    fan: 'Matematika',
    time: '30 daqiqa',
    istime: true,
    testId: 'ALG-2026',
    code: 'ALG11-7XK2',
    isPublic: true,
    author: { name: 'Ali Student', initials: 'AS', color: 'linear-gradient(135deg, #635bff, #887fff)', time: 'Bugun, 14:32' },
    likes: 12,
    comments: 4
  },
  {
    id: 2,
    subject: '🧮 MATEMATIKA',
    title: 'Funksiyalar va grafiklar',
    description: 'Funksiya tushunchasi, aniqlanish sohasi, qiymatlar sohasi va grafiklar.',
    fan: 'Matematika',
    time: '20 daqiqa',
    istime: true,
    testId: 'FUN-8831',
    code: 'FUN11-PQ91',
    isPublic: false,
    author: { name: 'Madina Teacher', initials: 'MD', color: 'linear-gradient(135deg, #10b981, #06b6d4)', time: 'Kecha, 19:08' },
    likes: 8,
    comments: 2
  }
]

export default function GroupList() {
  const [activeGroup, setActiveGroup] = useState(staticGroups[0])

  return (
    <div className="group-layout">
      {/* Groups Panel */}
      <aside className="groups-panel">
        <div className="panel-title">
          <h3>Guruhlarim</h3>
          <span className="count">{staticGroups.length}</span>
        </div>
        <div className="group-list">
          {staticGroups.map((group) => (
            <div
              key={group.id}
              className={`group-item ${activeGroup.id === group.id ? 'active' : ''}`}
              onClick={() => setActiveGroup(group)}
            >
              <div className="group-avatar" style={{ background: group.color }}>
                {group.initial}
              </div>
              <div className="group-info">
                <div className="group-name">{group.name}</div>
                <div className="group-meta">{group.memberCount} a'zo</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Test Feed */}
      <div className="feed">
        <div className="feed-header">
          <div className="feed-title">
            <h2>{activeGroup.name}</h2>
            <p>Guruhdagi testlar</p>
          </div>
          <button className="share-test">
            ＋ Test ulashish
          </button>
        </div>

        {/* Test Posts */}
        {staticTests.map((test) => (
          <article key={test.id} className="post">
            <div className="post-top">
              <div className="post-author">
                <div className="post-avatar" style={{ background: test.author.color }}>
                  {test.author.initials}
                </div>
                <div>
                  <div className="author-name">{test.author.name}</div>
                  <div className="post-time">{test.author.time}</div>
                </div>
              </div>
              <div className="more">•••</div>
            </div>

            <div className="post-description">
              Bugungi matematika mashg'uloti uchun yangi test. Hammaga omad! 📚
            </div>

            {/* Test Card */}
            <div className="test-card">
              <div className="test-card-main">
                <div className="test-card-head">
                  <div>
                    <div className="subject-label">
                      {test.subject}
                    </div>
                    <div className="test-title">
                      {test.title}
                    </div>
                  </div>
                  <div className={`public-badge ${test.isPublic ? 'public' : 'private'}`}>
                    {test.isPublic ? 'OMMAVIY' : 'YOPIQ'}
                  </div>
                </div>

                <div className="test-description">
                  {test.description}
                </div>

                <div className="test-stats">
                  <div>
                    <div className="stat-label">Fan</div>
                    <div className="stat-value">{test.fan}</div>
                  </div>
                  <div>
                    <div className="stat-label">Vaqt</div>
                    <div className="stat-value">{test.time}</div>
                  </div>
                  <div>
                    <div className="stat-label">Vaqtli</div>
                    <div className="stat-value">{test.istime ? 'Ha' : 'Yo\'q'}</div>
                  </div>
                  <div>
                    <div className="stat-label">Test ID</div>
                    <div className="stat-value">{test.testId}</div>
                  </div>
                </div>
              </div>

              <div className="test-card-footer">
                <div className="test-id">
                  code: {test.code}
                </div>
                <div className="test-actions">
                  <button className="small-btn">
                    Ko'rish
                  </button>
                  <button className="small-btn primary">
                    Testni ochish
                  </button>
                </div>
              </div>
            </div>

            <div className="post-footer">
              <span>♡ {test.likes}</span>
              <span>💬 {test.comments}</span>
              <span>↗ Ulashish</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
