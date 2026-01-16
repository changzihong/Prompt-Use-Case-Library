import type { PromptCard as PromptCardType } from '../types';
import { Star, Eye, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PromptCardProps {
    card: PromptCardType;
}

const PromptCard = ({ card }: PromptCardProps) => {
    const expiresAt = new Date(card.expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="glass-card fade-in" style={{ padding: '0', transition: 'transform 0.3s' }}>
            <div className="card-image" style={{ height: '160px', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span className={`badge ${daysLeft <= 3 ? 'badge-danger' : 'badge-primary'}`}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                    <ArrowUpRight size={40} opacity={0.2} />
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                <h3 className="card-title">{card.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {new Date(card.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-secondary)', opacity: 0.5 }}></span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>By {card.author_name}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {card.use_case}
                </p>

                <div className="card-meta" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '600' }}>
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            {card.avg_rating?.toFixed(1) || '0.0'}
                            <span style={{ fontSize: '0.75rem', fontWeight: '400', opacity: 0.7, marginLeft: '2px' }}>
                                ({card.rating_count || 0})
                            </span>
                        </span>
                        <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                            <Eye size={14} />
                            {card.view_count || 0}
                        </span>
                        <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                            <MessageSquare size={14} />
                            {card.comment_count || 0}
                        </span>
                    </div>

                    <Link to={`/card/${card.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem', borderRadius: '8px' }}>
                        View
                    </Link>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {card.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromptCard;
