import React, { useContext, useState, useEffect, useRef, use } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { nouser, user } from '../lib/menus'
// import { AuthContext } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'
import Hamburger from './ui/Hamburger'
import Logo from './ui/Logo'
import ThemeButton from './ui/ThemeButton'
import MenuNavbar from './MenuNavbar'
import ProfileTheme from './ui/ProfileTheme'
import { logo_img, profile_img } from '../api/request_testlar'
// import { profile_img } from '../../api/request'

export default function NavbarUser() {
    // const { token } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const user_sidebar = useRef(null)
    const user_sidebar_back = useRef(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(900)
    const themeLabel = theme === 'dark' ? 'Light' : 'Dark';
    const themeIcon = theme === 'dark' ? '☀️' : '🌙';
    let [profile, setProfile] = useState(null)
    let [logo, setLogo] = useState(null)


    const closeMobileMenu = (tag) => {
        if (windowWidth > 902) {
            setMobileMenuOpen(false);
            user_sidebar.current.style.left = '0'
        }
        else {
            if (tag == true) {
                user_sidebar.current.style.left = '0'
                user_sidebar_back.current.style.opacity = '1'
                user_sidebar_back.current.style.zIndex = 999
            }
            else if (tag == false) {
                user_sidebar.current.style.left = '-280px'
                user_sidebar_back.current.style.opacity = '0'
                user_sidebar_back.current.style.zIndex = -1
            }
            else {
                user_sidebar.current.style.left = '-280px'
                user_sidebar_back.current.style.opacity = '0'
                user_sidebar_back.current.style.zIndex = -1

            }

        }
        setMobileMenuOpen(tag == true ? tag : false);
    }

    useEffect(
        () => {
            closeMobileMenu(mobileMenuOpen)
        }, [mobileMenuOpen]
    )

    useEffect(
        () => {
            async function func() {
                setProfile(await profile_img())
                setLogo(await logo_img())
            }
            func()
        },
        []
    )
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);

            if (window.innerWidth > 902) {
                user_sidebar.current.style.left = "0";
                setMobileMenuOpen(true);
            } else {
                user_sidebar.current.style.left = "-280px";
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div>
            <MenuNavbar profile={profile} themeIcon={themeIcon} themeLabel={themeLabel} toggleTheme={toggleTheme} closeMobileMenu={closeMobileMenu} setMobileMenuOpen={setMobileMenuOpen} mobileMenuOpen={mobileMenuOpen} />
            <div className='user-sidebar-back' ref={user_sidebar_back} onClick={closeMobileMenu}></div>
            <div className='user-sidebar' ref={user_sidebar} /*style={{left: mobileMenuOpen || windowWidth > 902? '0' : '-280px'}}*/ >
                <Logo logo={logo} closeMobileMenu={closeMobileMenu}></Logo>

                <Hamburger setMobileMenuOpen={setMobileMenuOpen} mobileMenuOpen={mobileMenuOpen} />
                <div className='navs-menu'>
                    <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>

                        {
                            user.map((menu) => {
                                return (
                                    <li key={menu.link}>
                                        <NavLink
                                            to={menu.link}
                                            onClick={mobileMenuOpen && windowWidth < 902 ? () => closeMobileMenu(false) : () => closeMobileMenu(false)}
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
                        }
                    </ul>
                    <ProfileTheme profile={profile} closeMobileMenu={closeMobileMenu} themeIcon={themeIcon} toggleTheme={toggleTheme} themeLabel={themeLabel}></ProfileTheme>
                </div>
            </div>
        </div>
    )
}
