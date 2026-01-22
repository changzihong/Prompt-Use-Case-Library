import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Star, TrendingUp, MessageSquare, Award, Loader2, ChevronRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PromptCard as PromptCardType } from '../types';

const Leadership = () => {
    const { isAdmin } = useAuth();
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'views' | 'feedback' | 'rating'>('views');
    const [showAll, setShowAll] = useState(false);

    const [data, setData] = useState<{
        rating: PromptCardType[];
        views: PromptCardType[];
        feedback: PromptCardType[];
    }>({ rating: [], views: [], feedback: [] });

    useEffect(() => {
        fetchData();

        // Real-time subscription
        const channel = supabase
            .channel('leadership-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'prompts' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, isAdmin]);

    const [hoveredTab, setHoveredTab] = useState<string | null>(null);

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'views': return <TrendingUp size={18} />;
            case 'feedback': return <MessageSquare size={18} />;
            case 'rating': return <Star size={18} />;
            default: return null;
        }
    };

    const fetchData = async () => {
        if (!sessionId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data: allPrompts } = await supabase
                .from('prompts')
                .select('*')
                .eq('session_id', sessionId);

            if (allPrompts) {
                setData({
                    rating: [...allPrompts].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)),
                    views: [...allPrompts].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)),
                    feedback: [...allPrompts].sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0))
                });
            }
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentData = data[activeTab];
    const displayData = showAll ? currentData : currentData.slice(0, 5);
    const hasMore = currentData.length > 5;

    if (!sessionId) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '24px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    color: 'var(--danger)'
                }}>
                    <Shield size={40} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '12px' }}>Access Restricted</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                    You must join a session via a shared link to view the leaderboard.
                </p>
                <div style={{ marginTop: '40px' }}>
                    <Link to="/" className="btn-secondary">Return to Home</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="container pb-32 fade-in" style={{ paddingTop: '60px' }}>
            <section style={{ textAlign: 'center', marginBottom: '60px' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary)',
                    marginBottom: '20px'
                }}>
                    <Award size={32} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '12px' }}>
                    Prompt <span style={{ color: 'var(--primary)' }}>Leaderboard</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Celebrating the most impactful prompts in our community.
                </p>
            </section>

            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto 40px', padding: '32px' }}>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '16px', marginBottom: '32px', width: 'fit-content', margin: '0 auto 32px' }}>
                    {(['views', 'feedback', 'rating'] as const).map((tab) => {
                        const isExpanded = activeTab === tab || hoveredTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setShowAll(false); }}
                                onMouseEnter={() => setHoveredTab(tab)}
                                onMouseLeave={() => setHoveredTab(null)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem',
                                    fontWeight: '700',
                                    background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    textTransform: 'capitalize',
                                    minWidth: '50px'
                                }}
                            >
                                {getTabIcon(tab)}
                                <span style={{
                                    maxWidth: isExpanded ? '100px' : '0px',
                                    opacity: isExpanded ? 1 : 0,
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    marginLeft: isExpanded ? '8px' : '0px',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-block'
                                }}>
                                    {tab}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {displayData.map((item, index) => (
                        <Link
                            key={item.id}
                            to={`/card/${item.id}${sessionId ? `?session=${sessionId}` : ''}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div
                                className="hover-highlight"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: index === 0 ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                    border: index === 0 ? '1px solid rgba(99, 102, 241, 0.1)' : '1px solid transparent'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: index === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.1rem',
                                    fontWeight: '900',
                                    color: index === 0 ? 'white' : 'var(--text-secondary)',
                                    flexShrink: 0
                                }}>
                                    {index + 1}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>{item.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        <span>By {item.author_name} ({item.author_role})</span>
                                        <span style={{ opacity: 0.3 }}>•</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {activeTab === 'rating' && <><Star size={14} fill="#f59e0b" color="#f59e0b" /> <span style={{ color: '#f59e0b', fontWeight: '700' }}>{item.avg_rating?.toFixed(1)}</span></>}
                                            {activeTab === 'views' && <><TrendingUp size={14} /> {item.view_count || 0} views</>}
                                            {activeTab === 'feedback' && <><MessageSquare size={14} /> {item.comment_count || 0} feedback</>}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={20} style={{ opacity: 0.3 }} />
                            </div>
                        </Link>
                    ))}
                </div>

                {hasMore && !showAll && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="btn-secondary"
                        style={{ width: '100%', marginTop: '32px', height: '50px', borderRadius: '12px' }}
                    >
                        View All Rankers ({currentData.length})
                    </button>
                )}

                {showAll && (
                    <button
                        onClick={() => setShowAll(false)}
                        className="btn-secondary"
                        style={{ width: '100%', marginTop: '32px', height: '50px', borderRadius: '12px', opacity: 0.6 }}
                    >
                        Show Top 5 Only
                    </button>
                )}
            </div>
        </div>
    );
};

export default Leadership;
