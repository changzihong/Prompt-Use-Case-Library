import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="fade-in" style={{ maxWidth: '400px', margin: '80px auto' }}>
            <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: 'var(--primary)'
                    }}>
                        <Lock size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Admin Login</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Access to moderation tools and analytics.</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--danger)',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                required
                                className="glass-input"
                                style={{ width: '100%', paddingLeft: '40px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
                            <Link to="/admin/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                                Forgot Password?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="glass-input"
                                style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                    <Link to="/admin/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
