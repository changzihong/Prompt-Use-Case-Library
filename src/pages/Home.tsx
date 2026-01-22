import { useState, useEffect } from 'react';
import PromptCard from '../components/PromptCard';
import type { PromptCard as PromptCardType } from '../types';
import { Search, Loader2, ChevronDown, TrendingUp, Star, MessageSquare, Calendar, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import JoinSessionForm from '../components/JoinSessionForm';

interface HomeProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
}

type SortOption = 'newest' | 'views' | 'rating' | 'comments';

const Home = ({ searchTerm, setSearchTerm }: HomeProps) => {
    const { isAdmin } = useAuth();
    const { isUserInSession } = useSession();
    const [cards, setCards] = useState<PromptCardType[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>('newest');


    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session');

    useEffect(() => {
        if (sessionId || isAdmin) {
            fetchPrompts();

            // Real-time subscription
            const channel = supabase
                .channel('library-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'prompts' }, () => {
                    fetchPrompts();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else {
            setLoading(false); // If no sessionId, stop loading state
        }
    }, [sessionId]); // Removed isAdmin from dependencies to enforce sessionId filtering

    const fetchPrompts = async () => {
        if (!sessionId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('prompts')
                .select('*, photos(*)')
                .eq('session_id', sessionId);

            if (error) throw error;
            setCards(data || []);
        } catch (error) {
            console.error('Error fetching prompts:', error);
        } finally {
            setLoading(false);
        }
    };

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
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Access <span style={{ color: 'var(--danger)' }}>Restricted</span></h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '1.25rem' }}>
                    Please use a unique session link to access your specific prompt library.
                </p>
                {isAdmin ? (
                    <div style={{ marginTop: '40px' }}>
                        <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
                    </div>
                ) : (
                    <div style={{ marginTop: '40px' }}>
                        <Link to="/" className="btn-secondary">Return to Home</Link>
                    </div>
                )}
            </div>
        );
    }

    if (!isUserInSession && !isAdmin && sessionId) {
        return <JoinSessionForm />;
    }

    const getSortedCards = (cardsToSort: PromptCardType[]) => {
        let filtered = [...cardsToSort];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(term) ||
                c.use_case.toLowerCase().includes(term) ||
                c.prompt.toLowerCase().includes(term) ||
                c.tags?.some(t => t.toLowerCase().includes(term))
            );
        }

        switch (sortBy) {
            case 'views':
                return filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
            case 'rating':
                return filtered.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
            case 'comments':
                return filtered.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
            case 'newest':
            default:
                return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
    };

    const finalCards = getSortedCards(cards);

    return (
        <div className="fade-in">
            <section style={{ marginBottom: '60px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                    The Prompt <span style={{ color: 'var(--primary)' }}>Library</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
                    A curated collection of industry-proven AI prompts for productivity and automation.
                </p>
            </section>

            <div style={{ marginBottom: '40px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search prompts by title, tag, or use-case..."
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: '48px', height: '56px', fontSize: '1rem' }}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="glass-input"
                        style={{
                            height: '56px',
                            paddingLeft: '40px',
                            paddingRight: '40px',
                            appearance: 'none',
                            cursor: 'pointer',
                            minWidth: '180px',
                            fontSize: '0.9rem'
                        }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="views">Most Viewed</option>
                        <option value="rating">Highest Rated</option>
                        <option value="comments">Most Comments</option>
                    </select>
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }}>
                        {sortBy === 'newest' && <Calendar size={18} />}
                        {sortBy === 'views' && <TrendingUp size={18} />}
                        {sortBy === 'rating' && <Star size={18} />}
                        {sortBy === 'comments' && <MessageSquare size={18} />}
                    </div>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                </div>


            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
                </div>
            ) : (
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>


                    <div className="grid grid-cols-3">
                        {finalCards.map(card => (
                            <PromptCard key={card.id} card={card} />
                        ))}
                    </div>

                    {finalCards.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
                            <p>No prompts found. Be the first to share one!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
