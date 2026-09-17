import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getAvatar, getCachedAvatar } from '../../api/profile'
import ThemeButton from './ThemeButton'

// const API_BASE = "http://localhost/api1";

export default function ProfileTheme({ profile, closeMobileMenu, themeIcon, toggleTheme, themeLabel }) {
  const [user, setUser] = useState()
  const [avatar, setAvatar] = useState(profile)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))
    setUser(userData)

    if (userData) {
      // Check cached avatar first
      const cachedAvatar = getCachedAvatar(userData.id)
      if (cachedAvatar) {
        setAvatar(cachedAvatar)
      }
      // else if (userData.avatar) {
      //   // Handle avatar URL - combine with API base if it's a relative path
      //   const avatarUrl = getAvatar(userData.avatar)
      //   setAvatar(avatarUrl)
      // }
    }
  }, [profile])

  const getAvatarDisplay = () => {
    if (avatar && avatar != 'null') {
      console.log('avatar=>', avatar);

      return <img src={avatar} alt="Avatar" />
    }
    // Fallback to first letter of username/nickname
    const firstLetter = user?.nickname?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'
    return (
      <div className="avatar-fallback">
        {firstLetter}
      </div>
    )
  }

  return (
    <ul className="profile-theme">
      <li>
        <Link to={'/profile'} onClick={closeMobileMenu}>
          {getAvatarDisplay()}
          <p>
            {user?.nickname || user?.username}
          </p>
        </Link>
      </li>
      <li>
        <ThemeButton closeMobileMenu={closeMobileMenu} themeIcon={themeIcon} toggleTheme={toggleTheme} themeLabel={themeLabel}></ThemeButton>
      </li>
    </ul>
  )
}
