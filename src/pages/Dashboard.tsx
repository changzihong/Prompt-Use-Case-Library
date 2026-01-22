import { useState, useEffect } from 'react';
import {
    TrendingUp, Star,
    Clock, Loader2, MessageSquare, BarChart3, PieChart as PieIcon, Calendar,
    Share2, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { PromptCard } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Rectangle, Sector
} from 'recharts';
import { useSession } from '../context/SessionContext';
import { useNotifications } from '../context/NotificationContext';

const PieChartAny = PieChart as any;
const PieAny = Pie as any;

const Dashboard = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const { allSessions } = useSession();
    const { showToast } = useNotifications();

    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (allSessions.length > 0 && !selectedSessionId) {
            setSelectedSessionId(allSessions[allSessions.length - 1].id);
        }
    }, [allSessions, selectedSessionId]);

    const currentSession = allSessions.find(s => s.id === selectedSessionId) || (allSessions.length > 0 ? allSessions[0] : null);
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
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

    const copySessionLink = (id: string) => {
        const url = `${window.location.origin}/library?session=${id}`;
        navigator.clipboard.writeText(url);
        showToast('Link copied!', 'success');
    };

    if (!authLoading && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        if (isAdmin && currentSession) {
            fetchDashboardData();

            // Real-time subscriptions
            const promptsChannel = supabase
                .channel('dashboard-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'prompts' }, () => fetchDashboardData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchDashboardData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings' }, () => fetchDashboardData())
                .subscribe();

            return () => {
                supabase.removeChannel(promptsChannel);
            };
        }
    }, [isAdmin, selectedSessionId]);



    const renderActiveBar = (props: any) => {
        const { x, y, width, height, fill } = props;
        return (
            <Rectangle
                {...props}
                fill={fill}
                stroke={fill}
                strokeWidth={2}
                x={x - 2}
                width={width + 4}
                y={y - 5}
                height={height + 5}
                radius={[8, 8, 0, 0]}
            />
        );
    };

    const renderActivePieShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
        return (
            <g>
                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="var(--text-secondary)" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {payload.name}
                </text>
                <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#fff" style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                    {value}
                </text>
                <text x={cx} y={cy} dy={32} textAnchor="middle" fill="var(--primary)" style={{ fontSize: '0.7rem', fontWeight: '600' }}>
                    {(percent * 100).toFixed(0)}%
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' }}
                />
            </g>
        );
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Core Stats - Filtered by active session
            if (!currentSession) {
                setLoading(false);
                return;
            }

            const { data: allPrompts } = await supabase
                .from('prompts')
                .select('*')
                .eq('session_id', currentSession.id);

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

            // 5. Generate Weekly Trends (Real Data)
            const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const last7DaysData = [];

            // Get last 7 days context
            const now = new Date();
            const promptIds = allPrompts?.map(p => p.id) || [];

            // Fetch interaction timestamps from last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            const isoSevenDaysAgo = sevenDaysAgo.toISOString();

            let interactionsByDay: Record<string, number> = {};
            let promptsByDay: Record<string, number> = {};

            if (promptIds.length > 0) {
                const [{ data: cData }, { data: rData }] = await Promise.all([
                    supabase.from('comments').select('created_at').in('prompt_id', promptIds).gte('created_at', isoSevenDaysAgo),
                    supabase.from('ratings').select('created_at').in('prompt_id', promptIds).gte('created_at', isoSevenDaysAgo)
                ]);

                // Aggregate interactions
                [...(cData || []), ...(rData || [])].forEach(item => {
                    const day = new Date(item.created_at).getDay();
                    interactionsByDay[day] = (interactionsByDay[day] || 0) + 1;
                });

                // Aggregate prompts created
                allPrompts?.forEach(p => {
                    if (p.created_at >= isoSevenDaysAgo) {
                        const day = new Date(p.created_at).getDay();
                        promptsByDay[day] = (promptsByDay[day] || 0) + 1;
                    }
                });
            }

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(now.getDate() - i);
                const dayIndex = date.getDay();
                last7DaysData.push({
                    name: daysShort[dayIndex],
                    shared: promptsByDay[dayIndex] || 0,
                    interactions: interactionsByDay[dayIndex] || 0
                });
            }
            setWeeklyData(last7DaysData);

            // 6. Fetch Expiring Soon
            const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
            const { data: expiringData } = await supabase
                .from('prompts')
                .select('*')
                .eq('session_id', currentSession.id)
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

            {/* Primary Action Section - Active Workspace */}
            <div className="glass-card" style={{ padding: '32px', marginBottom: '40px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(124, 58, 237, 0.1))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Active <span style={{ color: 'var(--primary)' }}>Workspace</span></h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Share this unique link with your team to start collaborating in your isolated library.</p>
                    </div>
                </div>

                {allSessions.length > 1 && (
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Select Library Session</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={selectedSessionId || ''}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                className="glass-input"
                                style={{ width: '100%', paddingRight: '40px', cursor: 'pointer' }}
                            >
                                {allSessions.map((s, idx) => (
                                    <option key={s.id} value={s.id}>
                                        Library {idx + 1} ({new Date(s.createdAt).toLocaleDateString()}) - {s.id.substring(0, 8)}...
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>
                    </div>
                )}

                {currentSession && (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', marginBottom: '4px', textTransform: 'uppercase' }}>Your Sharable Link</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {window.location.origin}/library?session={currentSession.id}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => copySessionLink(currentSession.id)}
                                className="btn-primary"
                                style={{ height: '50px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                <Share2 size={18} /> Copy Sharable Link
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--success)', width: 'fit-content', marginBottom: '16px' }}>
                        <MessageSquare size={24} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: '500' }}>TOTAL FEEDBACK</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '4px' }}>{stats.totalComments.toLocaleString()}</h2>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px', color: '#f59e0b', width: 'fit-content', marginBottom: '16px' }}>
                        <Star size={24} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: '500' }}>AVG RATING</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '4px' }}>{stats.avgRating.toFixed(1)}</h2>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent)', width: 'fit-content', marginBottom: '16px' }}>
                        <Calendar size={24} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: '500' }}>TOTAL PROMPTS</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '4px' }}>{stats.totalPrompts.toLocaleString()}</h2>
                </div>
            </div>

            {/* Visual Displays */}
            {/* Weekly Analytics Section */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="var(--primary)" />
                    Weekly Performance Insights
                </h3>
                <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                itemStyle={{ color: '#ffffff' }}
                            />
                            <Area type="monotone" dataKey="shared" stroke="var(--primary)" fillOpacity={1} fill="url(#colorViews)" />
                            <Area type="monotone" dataKey="interactions" stroke="var(--success)" fill="none" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></div>
                        New Prompts
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ width: '12px', height: '12px', border: '2px dashed var(--success)', borderRadius: '3px' }}></div>
                        Engagement (Feedback/Ratings)
                    </div>
                </div>
            </div>

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
                                <Bar
                                    dataKey="views"
                                    fill="var(--primary)"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                    activeBar={renderActiveBar}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px', height: '400px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PieIcon size={20} color="var(--accent)" />
                        Category Distribution
                    </h3>
                    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChartAny>
                                <PieAny
                                    activeIndex={activePieIndex !== null ? activePieIndex : undefined}
                                    activeShape={renderActivePieShape}
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onMouseEnter={(_: any, index: number) => setActivePieIndex(index)}
                                    onMouseLeave={() => setActivePieIndex(null)}
                                    animationDuration={1000}
                                >
                                    {categoryData.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="none"
                                            style={{ transition: 'all 0.3s ease' }}
                                        />
                                    ))}
                                </PieAny>
                                <Tooltip
                                    trigger="hover"
                                    content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div style={{
                                                    background: '#0f172a',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    <p style={{ fontWeight: '700', color: '#fff' }}>{payload[0].name}</p>
                                                    <p style={{ color: 'var(--primary)' }}>{payload[0].value} Prompts</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChartAny>
                        </ResponsiveContainer>
                        {activePieIndex === null && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                pointerEvents: 'none'
                            }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Distribution</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stats.totalPrompts}</p>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '-10px' }}>
                            {categoryData.map((entry, index) => (
                                <div
                                    key={entry.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        opacity: activePieIndex === null || activePieIndex === index ? 1 : 0.4,
                                        transition: 'opacity 0.3s ease'
                                    }}
                                >
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
                                        {item.avg_rating?.toFixed(1) || '0.0'}
                                    </div>
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
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: 'white',
                                        fontWeight: '700',
                                        background: 'rgba(239, 68, 68, 0.9)',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        display: 'inline-block'
                                    }}>
                                        {Math.ceil((new Date(item.expires_at || '').getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div >
    );
};

export default Dashboard;
