import React from 'react'

export default function ProfileTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Umumiy ko\'rinish', icon: 'bi-grid' },
    { id: 'results', label: 'Natijalar', icon: 'bi-bar-chart' },
    { id: 'activity', label: 'Faollik', icon: 'bi-clock-history' },
    { id: 'achievements', label: 'Yutuqlar', icon: 'bi-trophy' },
    { id: 'settings', label: 'Sozlamalar', icon: 'bi-gear' },
  ]

  return (
    <div className="profile-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <i className={`bi ${tab.icon}`}></i>
          {tab.label}
        </button>
      ))}
    </div>
  )
}