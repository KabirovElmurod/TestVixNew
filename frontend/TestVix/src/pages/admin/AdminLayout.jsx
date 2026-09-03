import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
// import '../../../style/block/admin/admin.scss';

const NAV_ITEMS = [
    { to: '/admin', end: true, icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Foydalanuvchilar' },
    { to: '/admin/tests', icon: '📝', label: 'Testlar' },
    { to: '/admin/hashtags', icon: '#️⃣', label: 'Hashtaglar' },
    { to: '/admin/results', icon: '📊', label: 'Natijalar' },
    { to: '/admin/settings', icon: '⚙️', label: 'Sozlamalar' },
    { to: '/admin/logout', icon: '🚪', label: 'Chiqish' },
];

const PAGE_TITLES = {
    '/admin': 'Dashboard',
    '/admin/users': 'Foydalanuvchilar',
    '/admin/tests': 'Testlar',
    '/admin/hashtags': 'Hashtaglar',
    '/admin/results': 'Natijalar',
    '/admin/settings': 'Sozlamalar',
    '/admin/logout': 'Chiqish',
};

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { pathname } = useLocation();

    return (
        <div className={`admin ${collapsed ? 'admin--collapsed' : ''}`}>
            <aside className="admin__sidebar">
                <div className="admin__brand">
                    <span className="admin__brand-logo">TV</span>
                    {!collapsed && <span className="admin__brand-name">TestVix Admin</span>}
                </div>
                <nav className="admin__nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `admin__nav-link ${isActive ? 'admin__nav-link--active' : ''}`
                            }
                        >
                            <span className="admin__nav-icon">{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>
                <div className="admin__sidebar-footer">
                    <div className="admin__user-chip">
                        <span className="admin__avatar">EK</span>
                        {!collapsed && (
                            <div>
                                <p className="admin__user-name">Elmurod Kabirov</p>
                                <p className="admin__user-role">Superadmin</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <div className="admin__main">
                <header className="admin__header">
                    <div>
                        <h1 className="admin__title">{PAGE_TITLES[pathname] ?? 'Admin'}</h1>
                        <p className="admin__subtitle">Boshqaruv paneli</p>
                    </div>
                    <div className="admin__actions">
                        <button
                            className="admin__toggle-btn"
                            onClick={() => setCollapsed((c) => !c)}
                            aria-label="Menyuni yigish"
                        >
                            {collapsed ? '→' : '←'}
                        </button>
                    </div>
                </header>
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}