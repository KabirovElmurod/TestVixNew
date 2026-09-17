import React from 'react'

export default function ActivityTab({ activities }) {
  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'
    if (score >= 70) return '#3b82f6'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'test': return '📝'
      case 'achievement': return '🏆'
      default: return '📌'
    }
  }

  return (
    <div className="tab-panel activity-panel">
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-title">{activity.title}</div>
              <div className="activity-date">{activity.date}</div>
            </div>
            {activity.score !== null && (
              <div className="activity-score" style={{ color: getScoreColor(activity.score) }}>
                {activity.score}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}