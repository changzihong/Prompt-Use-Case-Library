import { Link, useLocation } from 'react-router-dom';
import { Layout, PlusSquare, Home, BarChart2, User, LogIn, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
    onToggleAssistant: () => void;
}

const Navbar = ({ onToggleAssistant }: NavbarProps) => {
    const location = useLocation();
    const { isAdmin, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="header" style={{ height: '80px', marginBottom: '40px' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layout size={28} color="#6366f1" />
                    <span>PromptLib</span>
                </Link>

                <nav className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Home size={18} />
                        <span className="hide-mobile">Feed</span>
                    </Link>
                    <Link to="/post" className={`nav-link ${isActive('/post') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PlusSquare size={18} />
                        <span className="hide-mobile">Prompt Case</span>
                    </Link>
                    {isAdmin && (
                        <>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <BarChart2 size={18} />
                                <span className="hide-mobile">Dashboard</span>
                            </Link>
                            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={18} />
                                <span className="hide-mobile">Profile</span>
                            </Link>
                        </>
                    )}
                </nav>

                <div className="auth-status" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={onToggleAssistant}
                        className="btn-primary"
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'none' }}
                    >
                        <Sparkles size={18} />
                        <span className="hide-mobile">AI Help</span>
                    </button>

                    {isAdmin ? (
                        <button
                            onClick={logout}
                            className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                        >
                            <LogOut size={18} />
                            <span className="hide-mobile">Logout</span>
                        </button>
                    ) : (
                        <Link
                            to="/admin/login"
                            className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                        >
                            <LogIn size={18} />
                            <span>Admin</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
