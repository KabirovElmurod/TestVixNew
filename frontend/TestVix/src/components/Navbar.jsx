import React, { useContext, useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { nouser, user } from '../lib/menus'
import { AuthContext } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'
import Hamburger from './ui/Hamburger'
import Logo from './ui/Logo'
import ThemeButton from './ui/ThemeButton'
import MenuNavbar from './MenuNavbar'
import ProfileTheme from './ui/ProfileTheme'
import { profile_img } from '../api/request_testlar'
// import { profile_img } from '../../api/request'

export default function Navbar() {
    const { token } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(903)
    const themeLabel = theme === 'dark' ? 'Light' : 'Dark';
    const themeIcon = theme === 'dark' ? '☀️' : '🌙';
    let [profile, setProfile] = useState('')

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    }


    useEffect(
        () => {
            async function func() {
                setProfile(await profile_img())
            }
            func()
        },
        []
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
                <Logo closeMobileMenu={closeMobileMenu}></Logo>

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
