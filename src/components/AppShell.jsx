import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

const links = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/workout', icon: '🏋️', label: 'Workout Plan' },
    { to: '/diet', icon: '🥗', label: 'Diet Plan' },
    { to: '/progress', icon: '📈', label: 'Progress' },
    { to: '/measurements', icon: '📏', label: 'Measurements' },
    { to: '/habits', icon: '🔥', label: 'Habit Score' },
    { to: '/analytics', icon: '📉', label: 'Analytics' },
    { to: '/roadmap', icon: '🗺️', label: 'Roadmap' },
    { to: '/report', icon: '📋', label: 'Report' },
    { to: '/chat', icon: '🤖', label: 'AI Coach' },
];

export default function AppShell() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('fitai_token');
        localStorage.removeItem('fitai_user');
        navigate('/login');
    };

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-logo">⚡ FitAI</div>
                <nav className="sidebar-nav">
                    {links.map(l => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.to === '/'}
                            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                        >
                            <span className="icon">{l.icon}</span>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>
                <button className="btn btn-outline btn-sm btn-block" onClick={logout}>
                    Logout
                </button>
            </aside>

            <main className="main-content">
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </main>
        </div>
    );
}
