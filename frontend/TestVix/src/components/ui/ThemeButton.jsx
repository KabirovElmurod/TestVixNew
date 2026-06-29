import React from 'react'

export default function ThemeButton({closeMobileMenu, themeIcon, toggleTheme, themeLabel}) {
  return (
        <button type="button" className="theme_toggle" onClick={() => {
        toggleTheme();
        closeMobileMenu();
        }}>
            {themeIcon} {themeLabel}
        </button>
  )
}
