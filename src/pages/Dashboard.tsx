import { useState, useEffect } from 'react';
import {
    TrendingUp, Star,
    Tag, Clock, Award, Loader2, MessageSquare, BarChart3, PieChart as PieIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { PromptCard } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const Dashboard = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalViews: 0,
        avgRating: 0,
        activeContributors: 0,
        totalPrompts: 0,
        totalComments: 0
    });
    const [topRated, setTopRated] = useState<PromptCard[]>([]);
    const [mostViewed, setMostViewed] = useState<PromptCard[]>([]);
    const [expiring, setExpiring] = useState<PromptCard[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    useEffect(() => {
        if (isAdmin) {
            fetchDashboardData();
        }
    }, [isAdmin]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Core Stats
            const { data: allPrompts } = await supabase.from('prompts').select('*');

            const totalViews = allPrompts?.reduce((acc, p) => acc + (p.view_count || 0), 0) || 0;
            const avgRating = allPrompts?.length ? (allPrompts.reduce((acc, p) => acc + (p.avg_rating || 0), 0) / allPrompts.length) : 0;
            const uniqueAuthors = new Set(allPrompts?.map(p => p.author_name)).size;
            const totalComments = allPrompts?.reduce((acc, p) => acc + (p.comment_count || 0), 0) || 0;

            setStats({
                totalViews,
                avgRating,
                activeContributors: uniqueAuthors,
                totalPrompts: allPrompts?.length || 0,
                totalComments
            });

            // 2. Prepare Chart Data (Views per Prompt)
            const viewsData = allPrompts?.map(p => ({
                name: p.title.length > 15 ? p.title.substring(0, 12) + '...' : p.title,
                views: p.view_count || 0,
                rating: p.avg_rating || 0
            })).sort((a, b) => b.views - a.views).slice(0, 6) || [];
            setChartData(viewsData);

            // 3. Prepare Category Data
            const categories: Record<string, number> = {};
            allPrompts?.forEach(p => {
                p.tags?.forEach((tag: string) => {
                    categories[tag] = (categories[tag] || 0) + 1;
                });
            });
            const pieData = Object.entries(categories)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);
            setCategoryData(pieData);

            // 4. Fetch Top Rated & Most Viewed lists
            setTopRated(allPrompts?.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)).slice(0, 3) || []);
            setMostViewed(allPrompts?.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 3) || []);

            // 5. Fetch Expiring Soon
            const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
            const { data: expiringData } = await supabase
                .from('prompts')
                .select('*')
                .lte('expires_at', threeDaysFromNow)
                .order('expires_at', { ascending: true })
                .limit(4);
            setExpiring(expiringData || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    if (authLoading) return null;
    if (!isAdmin) return <Navigate to="/admin/login" />;

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading analytical workspace...</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <section style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>Admin <span style={{ color: 'var(--primary)' }}>Dashboard</span></h1>
                <p style={{ color: 'var(--text-secondary)' }}>Advanced prompt discovery analytics and library health metrics.</p>
            </section>

            {/* KPI Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: '40px', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)', width: 'fit-content', marginBottom: '16px' }}>
                        <TrendingUp size={24} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: '500' }}>TOTAL VIEWS</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '4px' }}>{stats.totalViews.toLocaleString()}</h2>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px', color: '#f59e0b', width: 'fit-content', marginBottom: '16px' }}>
                        <Star size={24} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: '500' }}>AVG RATING</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '4px' }}>{stats.avgRating.toFixed(1)}</h2>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--success)', width: 'fit-content', marginBottom: '16px' }}>
                        <MessageSquare size={24} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: '500' }}>TOTAL COMMENTS</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '4px' }}>{stats.totalComments}</h2>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent)', width: 'fit-content', marginBottom: '16px' }}>
                        <Tag size={24} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: '500' }}>LIBRARY SIZE</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '4px' }}>{stats.totalPrompts}</h2>
                </div>
            </div>

            {/* Visual Displays */}
            <div className="grid grid-cols-2" style={{ gap: '32px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '24px', height: '400px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={20} color="var(--primary)" />
                        Prompt Performance (Views)
                    </h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#ffffff', fontWeight: '600' }}
                                    labelStyle={{ color: '#ffffff', marginBottom: '4px', fontWeight: '700' }}
                                />
                                <Bar dataKey="views" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px', height: '400px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PieIcon size={20} color="var(--accent)" />
                        Category Distribution
                    </h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#ffffff', fontWeight: '600' }}
                                    labelStyle={{ color: '#ffffff', fontWeight: '700' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '-20px' }}>
                            {categoryData.map((entry, index) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '32px' }}>
                <section>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={20} color="#f59e0b" />
                        Highest Rated
                    </h3>
                    <div className="glass-card" style={{ padding: '0' }}>
                        {topRated.map((item, index) => (
                            <Link to={`/card/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ padding: '16px 24px', borderBottom: index === topRated.length - 1 ? 'none' : '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-highlight">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', marginBottom: '2px' }}>{item.title}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.author_name}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '700' }}>
                                        <Star size={14} fill="#f59e0b" />
                                        {item.avg_rating?.toFixed(1)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} color="var(--primary)" />
                        Most Viewed
                    </h3>
                    <div className="glass-card" style={{ padding: '0' }}>
                        {mostViewed.map((item, index) => (
                            <Link to={`/card/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ padding: '16px 24px', borderBottom: index === mostViewed.length - 1 ? 'none' : '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-highlight">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                        <div>
                                            <p style={{ fontWeight: '600', marginBottom: '2px' }}>{item.title}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.view_count.toLocaleString()} views</p>
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>HOT</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={20} color="var(--danger)" />
                        Expiring Soon
                    </h3>
                    <div className="grid grid-cols-4" style={{ gap: '20px' }}>
                        {expiring.map(item => (
                            <Link to={`/card/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="glass-card" style={{ padding: '20px' }}>
                                    <h4 style={{ fontWeight: '600', fontSize: '0.9375rem', marginBottom: '8px' }}>{item.title}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600' }}>
                                        {Math.ceil((new Date(item.expires_at || '').getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
