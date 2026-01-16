import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail, Briefcase, Calendar, Clock,
    Layout, Star, Eye, LogOut, ChevronRight, Loader2, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { PromptCard } from '../types';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [stats, setStats] = useState({
        count: 0,
        avgRating: 0,
        totalViews: 0
    });
    const [contributions, setContributions] = useState<PromptCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            // In this specific app, authors are identified by their name in the 'prompts' table
            // We'll use the user's email or metadata to filter contributions
            // For now, let's fetch prompts where author_name matches or just all prompts if admin
            const { data: prompts, error } = await supabase
                .from('prompts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter to simulate "Your Contributions" - in a real app you'd filter by user_id
            // For this version, we'll show all prompts if it's the main admin account
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

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
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
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

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
                            <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
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
