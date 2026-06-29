import React from 'react'

export default function Hamburger({ setMobileMenuOpen, mobileMenuOpen }) {
  return (
    <button 
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
        <span></span>
        <span></span>
        <span></span>
    </button>
  )
}
