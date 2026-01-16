import { useState, useEffect } from 'react';
import PromptCard from '../components/PromptCard';
import type { PromptCard as PromptCardType } from '../types';
import { Search, Sparkles, Loader2, X, ChevronDown, TrendingUp, Star, MessageSquare, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HomeProps {
    aiFilterIds: string[];
    isAiFiltering: boolean;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    setIsAiFiltering: (val: boolean) => void;
    clearAiFilter: () => void;
}

type SortOption = 'newest' | 'views' | 'rating' | 'comments';

const Home = ({ aiFilterIds, isAiFiltering, searchTerm, setSearchTerm, setIsAiFiltering, clearAiFilter }: HomeProps) => {
    const [cards, setCards] = useState<PromptCardType[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCards(data || []);
        } catch (error) {
            console.error('Error fetching prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSortedCards = (cardsToSort: PromptCardType[]) => {
        const sorted = [...cardsToSort];
        switch (sortBy) {
            case 'views':
                return sorted.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
            case 'rating':
                return sorted.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
            case 'comments':
                return sorted.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
            case 'newest':
            default:
                return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
    };

    const filteredCards = cards.filter(card => {
        if (isAiFiltering) {
            return aiFilterIds.includes(card.id);
        }

        const searchLower = searchTerm.toLowerCase();
        return (
            card.title.toLowerCase().includes(searchLower) ||
            card.use_case.toLowerCase().includes(searchLower) ||
            card.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    });

    const finalCards = getSortedCards(filteredCards);

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
                            setIsAiFiltering(false);
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

                {isAiFiltering && (
                    <button onClick={clearAiFilter} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', borderColor: 'var(--primary)', height: '56px' }}>
                        <X size={18} /> Clear AI Filter
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
                </div>
            ) : (
                <>
                    {isAiFiltering && (
                        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                            <Sparkles size={16} color="var(--primary)" />
                            <span>AI filtered results based on your chat</span>
                        </div>
                    )}

                    <div className="grid grid-cols-3">
                        {finalCards.map(card => (
                            <PromptCard key={card.id} card={card} />
                        ))}
                    </div>

                    {finalCards.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
                            <Sparkles size={48} opacity={0.3} style={{ marginBottom: '16px' }} />
                            <p>No prompts found. Be the first to share one!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;
