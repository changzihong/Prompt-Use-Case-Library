import { useState } from 'react';
import type { PromptCard as PromptCardType } from '../types';
import { Star, Eye, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';

interface PromptCardProps {
    card: PromptCardType;
}

const PromptCard = ({ card }: PromptCardProps) => {
    const { isAdmin } = useAuth();
    const { showToast, showConfirm } = useNotifications();
    const { sessionId, allSessions } = useSession();
    const [isDeleting, setIsDeleting] = useState(false);

    // Check if current admin owns this prompt
    const isOwner = allSessions.some(s => s.id === card.session_id);
    const canDelete = isAdmin && isOwner;

    const sessionQuery = sessionId ? `?session=${sessionId}` : '';

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        showConfirm({
            title: 'Delete Prompt?',
            message: `Are you sure you want to delete "${card.title}"?`,
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                setIsDeleting(true);
                try {
                    const { error } = await supabase.from('prompts').delete().eq('id', card.id);
                    if (error) {
                        showToast(error.message, 'error');
                    } else {
                        showToast('Prompt deleted', 'success');
                    }
                } finally {
                    setIsDeleting(false);
                }
            }
        });
    };

    const expiresAt = new Date(card.expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="glass-card fade-in" style={{ padding: '0', transition: 'transform 0.3s' }}>
            <div className="card-image" style={{ height: '180px', background: 'rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                {card.photos && card.photos.length > 0 ? (
                    <img
                        src={card.photos[0].url}
                        alt={card.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ padding: '20px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic', height: '100%', overflow: 'hidden' }}>
                        <div style={{ opacity: 0.6, display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' }}>
                            {card.prompt}
                        </div>
                    </div>
                )}

                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                    <span className={`badge ${daysLeft <= 3 ? 'badge-danger' : 'badge-primary'}`} style={{
                        backdropFilter: 'blur(4px)',
                        background: daysLeft <= 3 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(99, 102, 241, 0.9)',
                        color: 'white',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </span>
                </div>
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '60px', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)', zIndex: 1 }}></div>
            </div>

            <div style={{ padding: '20px' }}>
                <h3 className="card-title">{card.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {new Date(card.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-secondary)', opacity: 0.5 }}></span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>By {card.author_name} ({card.author_role})</span>
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
                            {card.comment_count || 0} feedback
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                className="btn-secondary"
                                disabled={isDeleting}
                                style={{ padding: '6px 10px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', opacity: isDeleting ? 0.7 : 1 }}
                            >
                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                        )}
                        <Link to={`/card/${card.id}${sessionQuery}`} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8125rem', borderRadius: '8px', background: 'var(--primary)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                            Rate Me
                        </Link>
                    </div>
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
