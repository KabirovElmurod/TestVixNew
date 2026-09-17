import React, { useState, useEffect } from 'react'
import ProfileHero from './components/ProfileHero'
import StatsCards from './components/StatsCards'
import ProfileTabs from './components/ProfileTabs'
import OverviewTab from './components/OverviewTab'
import ResultsTab from './components/ResultsTab'
import ActivityTab from './components/ActivityTab'
import AchievementsTab from './components/AchievementsTab'
import SettingsTab from './components/SettingsTab'
import PasswordModal from './components/PasswordModal'
import DeleteAccountModal from './components/DeleteAccountModal'
import AvatarModal from './components/AvatarModal'
import { getProfile, updateProfile, changePassword, getUserStats, getUserResults, deleteAccount, getCachedAvatar, cacheAvatar, getAvatar } from '../../../api/profile'

// const API_BASE = "http://localhost/api1";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [editedUser, setEditedUser] = useState({
    username: '',
    email: '',
    nickname: '',
    bio: ''
  })
  const [stats, setStats] = useState({
    test_count: 0,
    result_count: 0,
    avg_score: 0,
    streak: 0
  })
  const [results, setResults] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [achievements, setAchievements] = useState([])

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  // Loading states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // User state
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch profile data
      const profileResponse = await getProfile()
      console.log('Profile response:', profileResponse)

      if (profileResponse.status && profileResponse.user) {
        const userData = profileResponse.user
        console.log('User data:', userData)
        userData.avatar = getAvatar(userData.avatar)
        console.log('User data:', userData)

        // Check cached avatar first
        const cachedAvatar = getCachedAvatar(userData.id)
        if (cachedAvatar && !userData.avatar) {
          userData.avatar = cachedAvatar
          console.log('Using cached avatar')
        } else if (userData.avatar) {
          // Cache the avatar from server
          cacheAvatar(userData.id, userData.avatar ? userData.avatar : null)
          console.log('Caching avatar:', userData.avatar)
        }

        setUser(userData)
        setEditedUser({
          username: userData.username || '',
          email: userData.email || '',
          nickname: userData.nickname || '',
          bio: userData.bio || ''
        })
      } else {
        console.error('Profile fetch failed:', profileResponse)
      }

      // Fetch stats
      const statsResponse = await getUserStats()
      if (statsResponse.status && statsResponse.stats) {
        setStats(statsResponse.stats)
      }

      // Fetch results
      const resultsResponse = await getUserResults(0, 20)
      if (resultsResponse.status && resultsResponse.results) {
        setResults(resultsResponse.results)

        // Generate recent activity from results
        const activity = resultsResponse.results.slice(0, 4).map(result => ({
          id: result.id,
          type: 'test',
          title: `Test #${result.test_id}`,
          date: formatDate(result.created),
          score: result.score
        }))
        setRecentActivity(activity)
      }

      // Set mock achievements (backendga qo'shilmagan)
      setAchievements([
        { id: 1, icon: '🏆', title: 'Birinchi test', description: 'Birinchi testni tugatdingiz', unlocked: true },
        { id: 2, icon: '🔥', title: '7 kunlik seriya', description: '7 kun davomida test yechdingiz', unlocked: stats.streak >= 7 },
        { id: 3, icon: '⭐', title: 'Mukammal ball', description: '100% ball olgan test', unlocked: results.some(r => r.score === 100) },
        { id: 4, icon: '📚', title: '50 ta test', description: '50 ta test tugatildi', unlocked: stats.test_count >= 50 },
        { id: 5, icon: '🎯', title: 'Aniqchilik', description: '90% dan yuqori o\'rtacha ball', unlocked: stats.avg_score >= 90 },
      ])

    } catch (err) {
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi')
      console.error('Error fetching profile data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Noma\'lum'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} daqiqa oldin`
    if (diffHours < 24) return `${diffHours} soat oldin`
    if (diffDays < 7) return `${diffDays} kun oldin`
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setEditedUser({
        username: user.username || '',
        email: user.email || '',
        nickname: user.nickname || '',
        bio: user.bio || ''
      })
    }
  }

  const handleSave = async () => {
    try {
      const response = await updateProfile(editedUser)
      if (response.status) {
        setIsEditing(false)
        // Refresh user data
        await fetchProfileData()
      } else {
        alert(response.message || 'Profilni yangilashda xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Profilni yangilashda xatolik yuz berdi')
    }
  }

  const handleChange = (e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value
    })
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)

    // Load results when switching to results tab
    if (tabId === 'results' && results.length === 0) {
      loadResults()
    }
  }

  const loadResults = async () => {
    try {
      const response = await getUserResults(0, 20)
      if (response.status && response.results) {
        setResults(response.results)
      }
    } catch (error) {
      console.error('Error loading results:', error)
    }
  }

  const handleAvatarClick = () => {
    setShowAvatarModal(true)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            user={user}
            isEditing={isEditing}
            editedUser={editedUser}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
            onChange={handleChange}
            onPasswordChange={() => setShowPasswordModal(true)}
            onDeleteAccount={() => setShowDeleteModal(true)}
          />
        )
      case 'results':
        return <ResultsTab results={results} onLoadMore={loadResults} />
      case 'activity':
        return <ActivityTab activities={recentActivity} />
      case 'achievements':
        return <AchievementsTab achievements={achievements} />
      case 'settings':
        return <SettingsTab />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Ma\'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Xatolik yuz berdi</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchProfileData}>
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <ProfileHero
        user={user}
        onEditProfile={handleEdit}
        onAvatarClick={handleAvatarClick}
      />

      <StatsCards stats={stats} />

      <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="tab-content">
        {renderTabContent()}
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={user?.avatar}
        userId={user?.id}
        onSuccess={fetchProfileData}
      />
    </div>
  )
}