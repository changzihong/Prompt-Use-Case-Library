import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, PlusSquare, BarChart2, User, LogIn, Award, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, logout } = useAuth();
    const { currentSession, allSessions } = useSession();

    const isActive = (path: string) => location.pathname === path;
    const isLandingPage = location.pathname === '/';
    const isAuthPage = location.pathname.startsWith('/admin/');

    const params = new URLSearchParams(window.location.search);
    const urlSessionId = params.get('session');

    const effectiveSessionId = urlSessionId || (isAdmin ? (currentSession?.id || allSessions[0]?.id) : null);
    const sessionQuery = effectiveSessionId ? `?session=${effectiveSessionId}` : '';

    const [hoveredNav, setHoveredNav] = useState<string | null>(null);

    const NavItem = ({ to, icon, label, path }: { to: string, icon: any, label: string, path: string }) => {
        const active = isActive(path);
        const isExpanded = active || hoveredNav === label;

        return (
            <Link
                to={to}
                className={`nav-link ${active ? 'active' : ''}`}
                onMouseEnter={() => setHoveredNav(label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isExpanded ? '8px' : '0px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}
            >
                {icon}
                <span style={{
                    maxWidth: isExpanded ? '120px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    {label}
                </span>
            </Link>
        );
    };

    const isCleanLayout = isLandingPage || isAuthPage;

    return (
        <header className="header" style={{ height: '80px', marginBottom: '40px' }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(150px, 1fr) auto minmax(150px, 1fr)',
                width: '100%',
                alignItems: 'center',
                height: '100%'
            }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Link to={effectiveSessionId ? `/library${sessionQuery}` : '/'} className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Layout size={32} color="#6366f1" />
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Prompt Library</span>
                    </Link>
                </div>

                {!isCleanLayout && (
                    <>
                        <nav className="nav-links" style={{ display: 'flex', gap: '8px', margin: '0 auto', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <NavItem to={`/library${sessionQuery}`} icon={<Layout size={18} />} label="Library" path="/library" />
                            <NavItem to={`/leadership${sessionQuery}`} icon={<Award size={18} />} label="Leaderboard" path="/leadership" />
                            {!isAdmin && (
                                <NavItem to={`/post${sessionQuery}`} icon={<PlusSquare size={18} />} label="Prompt Case" path="/post" />
                            )}
                            {isAdmin && (
                                <>
                                    <NavItem to={`/dashboard`} icon={<BarChart2 size={18} />} label="Dashboard" path="/dashboard" />
                                    <NavItem to={`/profile`} icon={<User size={18} />} label="Profile" path="/profile" />
                                </>
                            )}
                        </nav>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {!isAdmin && !urlSessionId && (
                                <div className="auth-status" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Link
                                        to="/admin/login"
                                        className="btn-secondary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                                    >
                                        <LogIn size={18} />
                                        <span>Admin</span>
                                    </Link>
                                </div>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={async () => {
                                        await logout();
                                        navigate('/');
                                    }}
                                    className="btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--danger)' }}
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;
