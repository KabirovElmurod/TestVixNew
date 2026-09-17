import React from 'react'

export default function AchievementsTab({ achievements }) {
  return (
    <div className="tab-panel achievements-panel">
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-info">
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-desc">{achievement.description}</div>
            </div>
            {!achievement.unlocked && (
              <div className="achievement-lock">
                <i className="bi bi-lock"></i>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}