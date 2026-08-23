import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import ThemeButton from './ThemeButton'

export default function ProfileTheme({ profile, closeMobileMenu, themeIcon, toggleTheme, themeLabel }) {
  const [user, setUser] = useState()
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')))
  }, [])
  return (
    <ul className="profile-theme">
      <li>
        <Link to={'/profile'} onClick={closeMobileMenu}>
          <img src={profile} alt="img" />
          <p>
            {user?.nickname}
          </p>
        </Link>
      </li>
      <li>
        <ThemeButton closeMobileMenu={closeMobileMenu} themeIcon={themeIcon} toggleTheme={toggleTheme} themeLabel={themeLabel}></ThemeButton>
      </li>
    </ul>
  )
}
