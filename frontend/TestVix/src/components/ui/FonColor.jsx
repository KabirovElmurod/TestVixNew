import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

export default function FonColor({ lightColor, darkColor, top_y, left_x, wd = '50%', ht = '70%', className = '' }) {
  const { theme } = useContext(ThemeContext);
  const color = theme === 'dark' ? darkColor : lightColor;

  return (
    <div
      className={`fon_color ${className}`}
      style={{
        background: `radial-gradient(circle, ${color} 80 0%, ${color}40 40%, transparent 70%)`,
        top: top_y ? `${top_y}px` : 'auto',
        left: left_x ? `${left_x}px` : 'auto',
        width: typeof wd === 'number' ? `${wd}px` : wd,
        height: typeof ht === 'number' ? `${ht}px` : ht,
        transition: 'all 0.3s ease'
      }}
    ></div>
  );
}
