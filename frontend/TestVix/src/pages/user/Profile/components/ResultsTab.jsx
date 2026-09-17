import React, { useState } from 'react'

export default function ResultsTab({ results, onLoadMore }) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(false)

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true
    if (filter === 'completed') return result.isfinish
    if (filter === 'incomplete') return !result.isfinish
    return true
  })

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created) - new Date(a.created)
    }
    if (sortBy === 'score') {
      const scoreA = a.score || 0
      const scoreB = b.score || 0
      return scoreB - scoreA
    }
    return 0
  })

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'
    if (score >= 70) return '#3b82f6'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return 'A\'lo'
    if (score >= 70) return 'Yaxshi'
    if (score >= 50) return 'Qoniqarli'
    return 'Qoniqarsiz'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Noma\'lum'
    const date = new Date(dateString)
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLoadMore = async () => {
    setLoading(true)
    try {
      if (onLoadMore) {
        await onLoadMore()
      }
    } catch (error) {
      console.error('Error loading more results:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tab-panel results-panel">
      <div className="results-header">
        <div className="results-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Barchasi
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Tugatilgan
          </button>
          <button
            className={`filter-btn ${filter === 'incomplete' ? 'active' : ''}`}
            onClick={() => setFilter('incomplete')}
          >
            Tugatilmagan
          </button>
        </div>
        <div className="results-sort">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sana bo\'yicha</option>
            <option value="score">Ball bo\'yicha</option>
          </select>
        </div>
      </div>

      {sortedResults.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Hali natijalar yo\'q</h3>
          <p>Test yeching va natijalaringizni shu yerda ko'ring</p>
        </div>
      ) : (
        <>
          <div className="results-list">
            {sortedResults.map((result) => {
              const score = result.score || 0
              return (
                <div key={result.id} className="result-card">
                  <div className="result-main">
                    <div className="result-info">
                      <div className="result-title">Test #{result.test_id}</div>
                      <div className="result-date">{formatDate(result.created)}</div>
                    </div>
                    <div className="result-status">
                      {result.isfinish ? (
                        <span className="status-badge completed">Tugatilgan</span>
                      ) : (
                        <span className="status-badge incomplete">Tugatilmagan</span>
                      )}
                    </div>
                  </div>

                  <div className="result-stats">
                    <div className="stat-group">
                      <div className="stat-item">
                        <span className="stat-label">Jami savollar</span>
                        <span className="stat-value">{result.sum_son}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">To'g'ri</span>
                        <span className="stat-value correct">{result.true_son}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Noto'g'ri</span>
                        <span className="stat-value incorrect">{result.false_son}</span>
                      </div>
                    </div>

                    <div className="result-score">
                      <div
                        className="score-circle"
                        style={{
                          background: `conic-gradient(${getScoreColor(score)} ${score}%, var(--input-border) ${score}%)`
                        }}
                      >
                        <div className="score-inner">
                          <span className="score-number">{score}%</span>
                        </div>
                      </div>
                      <div className="score-label" style={{ color: getScoreColor(score) }}>
                        {getScoreLabel(score)}
                      </div>
                    </div>
                  </div>

                  {result.answer && Object.keys(result.answer).length > 0 && (
                    <div className="result-details">
                      <button className="details-toggle">
                        <i className="bi bi-chevron-down"></i>
                        Batafsil
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {sortedResults.length >= 20 && (
            <div className="load-more-container">
              <button 
                className="btn btn-secondary" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Yuklanmoqda...' : 'Ko\'proq yuklash'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}