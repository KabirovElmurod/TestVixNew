import React from 'react'
import { Link } from 'react-router-dom'

export default function Logo({ logo, closeMobileMenu }) {
    return (
        <ul className="nav-logo">
            <li>
                <Link to='/' onClick={closeMobileMenu}>
                    <img src={logo} alt="img" />
                    <p>
                        TestVix
                    </p>
                </Link>
            </li>
        </ul>
    )
}
