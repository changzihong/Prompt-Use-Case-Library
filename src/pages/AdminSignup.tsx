import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, AlertCircle, UserPlus, ShieldCheck, Check, Eye, EyeOff } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const AdminSignup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useNotifications();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validations
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!agreeTerms) {
            setError("You must agree to the Terms and Conditions.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'admin'
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            showToast('Signup successful! Welcome aboard.', 'success');
            navigate('/admin/login');
        }
        setLoading(false);
    };

    return (
        <div className="fade-in" style={{ maxWidth: '440px', margin: '60px auto' }}>
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
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Admin Registry</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Create an administrative account to manage Propmlib.</p>
                </div>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                placeholder="admin@company.com"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="glass-input"
                                style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Check size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                className="glass-input"
                                style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="terms" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            I agree to the <Link to="/terms" style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'none' }}>Terms and Conditions</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>
                            <UserPlus size={18} />
                            Create Admin Account
                        </>}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                    <Link to="/admin/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
