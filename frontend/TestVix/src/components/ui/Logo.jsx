import React from 'react'
import { Link } from 'react-router-dom'

export default function Logo({closeMobileMenu}) {
  return (
    <ul className="nav-logo">
        <li>
            <Link to='/' onClick={closeMobileMenu}>
                <img src="https://static.vecteezy.com/system/resources/previews/036/324/852/non_2x/ai-generated-picture-of-a-tiger-walking-in-the-forest-photo.jpg" alt="img" />
                <p>
                    TestVix
                </p>
            </Link>
        </li>
    </ul>
  )
}
