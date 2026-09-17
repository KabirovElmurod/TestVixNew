import React from 'react'
import { useContext } from 'react'
import { ThemeContext } from '../../../../context/ThemeContext'

export default function SettingsTab() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <div className="tab-panel settings-panel">
      <div className="settings-grid">
        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon">🎨</div>
            <div className="setting-info">
              <h4>Tema</h4>
              <p>Ilova ko'rinishini tanlang</p>
            </div>
          </div>
          <div className="theme-selector">
            <button
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => toggleTheme()}
            >
              <i className="bi bi-sun"></i>
              <span>Yorqin</span>
            </button>
            <button
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => toggleTheme()}
            >
              <i className="bi bi-moon"></i>
              <span>Qorong'i</span>
            </button>
          </div>
        </div>

        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon">🌐</div>
            <div className="setting-info">
              <h4>Til</h4>
              <p>Ilova tilini tanlang</p>
            </div>
          </div>
          <select className="setting-select">
            <option value="uz">O'zbek tili</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon">🔔</div>
            <div className="setting-info">
              <h4>Bildirishnomalar</h4>
              <p>Bildirishnomalarni boshqaring</p>
            </div>
          </div>
          <div className="setting-toggles">
            <label className="toggle-item">
              <input type="checkbox" defaultChecked />
              <span>Email bildirishnomalari</span>
            </label>
            <label className="toggle-item">
              <input type="checkbox" defaultChecked />
              <span>Push bildirishnomalari</span>
            </label>
            <label className="toggle-item">
              <input type="checkbox" />
              <span>SMS bildirishnomalari</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}