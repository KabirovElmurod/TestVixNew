import React from 'react'
import Hamburger from './ui/Hamburger'
import Logo from './ui/Logo'
import ThemeButton from './ui/ThemeButton'
import ProfileTheme from './ui/ProfileTheme'
import { profile_img } from '../api/request_testlar'
import { Link } from 'react-router-dom'
export default function MenuNavbar({profile, themeIcon, themeLabel, toggleTheme, closeMobileMenu, setMobileMenuOpen, mobileMenuOpen}) {
  return (
    <div className='menu-navbar'>
      <div>
        <Hamburger setMobileMenuOpen={setMobileMenuOpen} mobileMenuOpen={mobileMenuOpen}></Hamburger>
        <Logo closeMobileMenu={closeMobileMenu}/>
      </div>
      <div>
        <ThemeButton closeMobileMenu={closeMobileMenu} themeIcon={themeIcon}  toggleTheme={toggleTheme} themeLabel={''}></ThemeButton>
        <Link to={'/profile'}>
          <img src={profile} alt="" />
        </Link>
      </div>
    </div>
  )
}
