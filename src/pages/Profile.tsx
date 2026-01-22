import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    Mail, Briefcase, Calendar, Clock,
    Layout, Star, Eye, EyeOff, ChevronRight, Loader2, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import type { PromptCard } from '../types';

const Profile = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }
    const [stats, setStats] = useState({
        count: 0,
        avgRating: 0,
        totalViews: 0
    });
    const [contributions, setContributions] = useState<PromptCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [visibility, setVisibility] = useState({ old: false, new: false, confirm: false });
    const { showToast } = useNotifications();

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const { data: prompts, error } = await supabase
                .from('prompts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setContributions(prompts || []);

            const totalViews = prompts?.reduce((acc, p) => acc + (p.view_count || 0), 0) || 0;
            const avgRating = prompts?.length
                ? (prompts.reduce((acc, p) => acc + (p.avg_rating || 0), 0) / prompts.length)
                : 0;

            setStats({
                count: prompts?.length || 0,
                avgRating,
                totalViews
            });
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (passwords.new.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setChangingPassword(true);
        try {
            // Verify old password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || '',
                password: passwords.old
            });

            if (signInError) {
                showToast('Incorrect current password', 'error');
                setChangingPassword(false);
                return;
            }

            // Update with new password
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwords.new
            });

            if (updateError) throw updateError;

            showToast('Password updated successfully', 'success');
            setPasswords({ old: '', new: '', confirm: '' });
            setShowPasswordForm(false);
        } catch (error: any) {
            showToast(error.message || 'Failed to update password', 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading profile...</p>
            </div>
        );
    }

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin User';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="fade-in">
            <div className="grid grid-cols-3" style={{ gap: '40px' }}>
                <div style={{ gridColumn: 'span 1' }}>
                    <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            margin: '0 auto 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px',
                            fontWeight: '700',
                            color: 'white',
                            border: '4px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
                        }}>
                            {initials}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>{displayName}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Administrator</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <Mail size={16} />
                                {user?.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <Briefcase size={16} />
                                System Administration
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <Calendar size={16} />
                                Joined {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="btn-secondary"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Lock size={18} />
                                {showPasswordForm ? 'Cancel Change' : 'Change Password'}
                            </button>
                        </div>

                        {showPasswordForm && (
                            <form onSubmit={handlePasswordChange} className="fade-in" style={{ marginTop: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>CURRENT PASSWORD</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={visibility.old ? "text" : "password"}
                                            required
                                            className="glass-input"
                                            style={{ width: '100%', paddingRight: '40px' }}
                                            value={passwords.old}
                                            onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setVisibility({ ...visibility, old: !visibility.old })}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                                        >
                                            {visibility.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }}></div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>NEW PASSWORD</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={visibility.new ? "text" : "password"}
                                            required
                                            className="glass-input"
                                            style={{ width: '100%', paddingRight: '40px' }}
                                            value={passwords.new}
                                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setVisibility({ ...visibility, new: !visibility.new })}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                                        >
                                            {visibility.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>CONFIRM NEW PASSWORD</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={visibility.confirm ? "text" : "password"}
                                            required
                                            className="glass-input"
                                            style={{ width: '100%', paddingRight: '40px' }}
                                            value={passwords.confirm}
                                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setVisibility({ ...visibility, confirm: !visibility.confirm })}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                                        >
                                            {visibility.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={changingPassword} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                                    {changingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <div className="grid grid-cols-3" style={{ marginBottom: '32px' }}>
                        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>{stats.count}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Prompts Managed</p>
                        </div>
                        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>{stats.avgRating.toFixed(1)}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Avg. Rating</p>
                        </div>
                        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>{(stats.totalViews / 1000).toFixed(1)}k</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Impact</p>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px' }}>Recent Library Contributions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {contributions.slice(0, 5).map(item => (
                            <div key={item.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/card/${item.id}`)}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        <Layout size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{item.title}</h4>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={12} fill="#f59e0b" color="#f59e0b" /> {item.avg_rating?.toFixed(1)}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {item.view_count}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(item.created_at || '').toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="var(--text-secondary)" />
                            </div>
                        ))}
                    </div>

                    <button className="btn-secondary" style={{ width: '100%', marginTop: '24px' }} onClick={() => navigate('/')}>Browse All Library</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
