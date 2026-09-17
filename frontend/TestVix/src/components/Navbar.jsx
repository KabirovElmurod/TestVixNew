import React, { useContext, useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { nouser, user } from '../lib/menus'
import { AuthContext } from '../context/AuthContext'
// import { AuthContext } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'
import Hamburger from './ui/Hamburger'
import Logo from './ui/Logo'
import ThemeButton from './ui/ThemeButton'
import MenuNavbar from './MenuNavbar'
import ProfileTheme from './ui/ProfileTheme'
import { logo_img, profile_img } from '../api/request_testlar'
import { getCachedAvatar } from '../api/profile'
// import { profile_img } from '../../api/request'

const API_BASE = "http://localhost/api1";

export default function Navbar() {
    const { token } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(903)
    const themeLabel = theme === 'dark' ? 'Light' : 'Dark';
    const themeIcon = theme === 'dark' ? '☀️' : '🌙';
    let [profile, setProfile] = useState('')
    let [logo, setLogo] = useState(null)
    const [user, setUser] = useState(null)

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    }

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'))
        setUser(userData)
    }, [])

    useEffect(
        () => {
            async function func() {
                const profileData = await profile_img()
                
                // Handle avatar URL
                if (user) {
                    const cachedAvatar = getCachedAvatar(user.id)
                    if (cachedAvatar) {
                        setProfile(cachedAvatar)
                    } else if (user.avatar) {
                        setProfile(user.avatar)
                    } else {
                        setProfile(profileData)
                    }
                } else {
                    setProfile(profileData)
                }
                
                setLogo(await logo_img())
            }
            func()
        },
        [user]
    )

    useEffect(
        () => {
            const handleResize = () => {

                setWindowWidth(window.innerWidth);
                if (window.innerWidth > 902) {
                    setMobileMenuOpen(true)
                }
                else {
                    setMobileMenuOpen(false)
                }
            };

            window.addEventListener("resize", handleResize);

            // cleanup
            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }, []);


    return (
        <div>
            <div className='navbar'>
                <Logo logo={logo} closeMobileMenu={closeMobileMenu}></Logo>

                <Hamburger setMobileMenuOpen={setMobileMenuOpen} mobileMenuOpen={mobileMenuOpen} />

                <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    {
                        token ? user.map((menu) => {
                            return (
                                <li key={menu.link}>
                                    <NavLink
                                        to={menu.link}
                                        onClick={mobileMenuOpen ? '' : closeMobileMenu}
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                    >
                                        <i className={menu.icon}></i>
                                        <span>
                                            {menu.name}
                                        </span>
                                    </NavLink>
                                </li>
                            )
                        })
                            :
                            nouser.map((menu) => {
                                return (
                                    <li key={menu.link}>
                                        <Link to={menu.link} className={menu.class} onClick={closeMobileMenu}>
                                            {menu.name}
                                        </Link>
                                    </li>
                                )
                            })
                    }
                    {/* <li>
                    <ThemeButton closeMobileMenu={closeMobileMenu} themeIcon={themeIcon} toggleTheme={toggleTheme} themeLabel={themeLabel}/>
                </li> */}
                </ul>
                {
                    token ?
                        <ProfileTheme profile={profile} closeMobileMenu={closeMobileMenu} themeIcon={themeIcon} toggleTheme={toggleTheme} themeLabel={themeLabel}></ProfileTheme>
                        : ''
                }
            </div>
        </div>
    )
}
