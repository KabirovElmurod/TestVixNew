import React from 'react'

export default function StatsCards({ stats }) {
  return (
    <div className="stats-grid">
      <div className="stat-card gradient-blue">
        <div className="stat-icon">📚</div>
        <div className="stat-content">
          <div className="stat-value">{stats.test_count}</div>
          <div className="stat-label">Testlar</div>
        </div>
        <div className="stat-trend positive">
          <i className="bi bi-arrow-up"></i>
          +12%
        </div>
      </div>
      <div className="stat-card gradient-green">
        <div className="stat-icon">🏆</div>
        <div className="stat-content">
          <div className="stat-value">{stats.result_count}</div>
          <div className="stat-label">Natijalar</div>
        </div>
        <div className="stat-trend positive">
          <i className="bi bi-arrow-up"></i>
          +8%
        </div>
      </div>
      <div className="stat-card gradient-purple">
        <div className="stat-icon">⭐</div>
        <div className="stat-content">
          <div className="stat-value">{stats.avg_score}%</div>
          <div className="stat-label">O'rtacha ball</div>
        </div>
        <div className="stat-trend positive">
          <i className="bi bi-arrow-up"></i>
          +5%
        </div>
      </div>
      <div className="stat-card gradient-orange">
        <div className="stat-icon">🔥</div>
        <div className="stat-content">
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Kunlik seriya</div>
        </div>
        <div className="stat-trend neutral">
          <i className="bi bi-dash"></i>
          ---
        </div>
      </div>
    </div>
  )
}