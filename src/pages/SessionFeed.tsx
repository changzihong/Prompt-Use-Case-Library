import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import {
    Send, Image as ImageIcon, Megaphone,
    MessageSquare, ThumbsUp, Users, Calendar, Shield, MapPin, Star
} from 'lucide-react';
import JoinSessionForm from '../components/JoinSessionForm';
import type { FeedItemType } from '../types';

const SessionFeed = () => {
    const {
        sessionId, currentSession, currentUser, isUserInSession,
        toggleLike, addFeedItem, rateItem, addComment
    } = useSession();

    // UI State
    const [title, setTitle] = useState('');
    const [useCase, setUseCase] = useState('');
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const postType: FeedItemType = 'text';

    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({});

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && useCase && prompt) {
            addFeedItem(postType, title, useCase, prompt, imageUrl || undefined);
            setTitle('');
            setUseCase('');
            setPrompt('');
            setImageUrl('');
        }
    };

    if (!sessionId) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Shield size={48} color="var(--danger)" style={{ marginBottom: '24px' }} />
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Session <span style={{ color: 'var(--danger)' }}>Required</span></h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '1.25rem' }}>
                    You need a valid session ID to view this feed.
                </p>
            </div>
        );
    }

    if (!isUserInSession) {
        return <JoinSessionForm />;
    }

    return (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Post Creation Area (New Prompt Case Form) */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>
                        Share a <span style={{ color: 'var(--primary)' }}>New Prompt Case</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px', fontSize: '0.9rem' }}>
                        Contribute to the library and help your teammates work smarter.
                    </p>

                    <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={16} color="var(--primary)" /> Your Name
                                </label>
                                <input
                                    className="glass-input"
                                    readOnly
                                    value={currentUser?.name || ''}
                                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ImageIcon size={16} color="var(--primary)" /> Job Position
                                </label>
                                <input
                                    className="glass-input"
                                    readOnly
                                    value={currentUser?.dept || ''}
                                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Title <span style={{ fontWeight: '400', opacity: 0.5 }}>(max 60 chars)</span></label>
                            <input
                                className="glass-input"
                                placeholder="e.g. Weekly Report Summarizer"
                                maxLength={60}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Use-case Scenario</label>
                            <textarea
                                className="glass-input"
                                style={{ minHeight: '80px' }}
                                placeholder="What problem does this prompt solve?"
                                value={useCase}
                                onChange={(e) => setUseCase(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>The Prompt</label>
                            <textarea
                                className="glass-input"
                                style={{ minHeight: '120px', fontFamily: 'monospace' }}
                                placeholder="Paste your prompt here..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>Screenshot URL (Optional)</label>
                            <div style={{
                                border: '2px dashed var(--glass-border)',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center',
                                background: 'rgba(255,255,255,0.02)'
                            }}>
                                <ImageIcon size={24} style={{ marginBottom: '8px', color: 'var(--primary)' }} />
                                <input
                                    type="text"
                                    className="glass-input"
                                    style={{ width: '100%', fontSize: '0.8rem' }}
                                    placeholder="Paste image URL here..."
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '48px' }}
                            >
                                <Shield size={18} /> Verify & Submit Case
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ height: '48px', padding: '0 24px' }}
                                onClick={() => {
                                    setTitle(''); setUseCase(''); setPrompt(''); setImageUrl('');
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>

                {/* Feed Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {currentSession?.feed.map((item) => (
                        <div key={item.id} className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '800',
                                        color: 'var(--primary)',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                        {item.authorName.substring(0, 1)}
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{item.authorName}</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={10} /> {item.authorDept} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                {item.type === 'announcement' && (
                                    <div style={{
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        color: '#f59e0b',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        height: 'fit-content',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Megaphone size={12} /> ANNOUNCEMENT
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px', color: 'var(--primary)' }}>{item.title}</h3>

                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Use-Case Scenario</p>
                                    <p style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>{item.useCase}</p>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: '1.6', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                                        {item.prompt}
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(item.prompt);
                                            alert('Prompt copied!');
                                        }}
                                        style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px 12px', fontSize: '0.7rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)' }}
                                        className="btn-secondary"
                                    >
                                        Copy
                                    </button>
                                </div>

                                {item.imageUrl && (
                                    <img
                                        src={item.imageUrl}
                                        alt="Proof"
                                        style={{ width: '100%', borderRadius: '16px', marginTop: '16px', maxHeight: '300px', objectFit: 'cover', border: '1px solid var(--glass-border)' }}
                                    />
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', gap: '24px' }}>
                                    <button
                                        onClick={() => toggleLike(item.id)}
                                        style={{ background: 'none', color: item.likes > 0 ? 'var(--primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '700' }}
                                    >
                                        <ThumbsUp size={18} fill={item.likes > 0 ? 'var(--primary)' : 'none'} /> {item.likes}
                                    </button>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [item.id]: star }))}
                                                onMouseLeave={() => setHoverRatings(prev => ({ ...prev, [item.id]: 0 }))}
                                                onClick={() => rateItem(item.id, star)}
                                                style={{ background: 'none', padding: '2px' }}
                                            >
                                                <Star
                                                    size={18}
                                                    fill={(hoverRatings[item.id] || 0) >= star || (item.ratings.reduce((a, b) => a + b, 0) / (item.ratings.length || 1)) >= star ? '#f59e0b' : 'none'}
                                                    color={(hoverRatings[item.id] || 0) >= star || (item.ratings.reduce((a, b) => a + b, 0) / (item.ratings.length || 1)) >= star ? '#f59e0b' : 'var(--text-secondary)'}
                                                />
                                            </button>
                                        ))}
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                                            ({item.ratings.length})
                                        </span>
                                    </div>
                                </div>

                                <button
                                    style={{ background: 'none', color: (item.comments?.length || 0) > 0 ? 'var(--primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '700' }}
                                >
                                    <MessageSquare size={18} /> {item.comments?.length || 0}
                                </button>
                            </div>

                            {/* Comment Section */}
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {item.comments?.map(comment => (
                                    <div key={comment.id} style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-secondary)' }}>
                                            {comment.authorName.substring(0, 1)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.8125rem', fontWeight: '600' }}>{comment.authorName}</p>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{comment.text}</p>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ flex: 1, padding: '8px 16px', fontSize: '0.8125rem' }}
                                        placeholder="Add a reaction..."
                                        value={commentTexts[item.id] || ''}
                                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [item.id]: e.target.value }))}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && commentTexts[item.id]) {
                                                addComment(item.id, commentTexts[item.id]);
                                                setCommentTexts(prev => ({ ...prev, [item.id]: '' }));
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (commentTexts[item.id]) {
                                                addComment(item.id, commentTexts[item.id]);
                                                setCommentTexts(prev => ({ ...prev, [item.id]: '' }));
                                            }
                                        }}
                                        className="btn-secondary"
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {currentSession?.feed.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
                            <Calendar size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                            <p>The feed is empty. Start the conversation!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Stats */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={18} color="var(--primary)" />
                        Connected ({currentSession?.users.length || 0})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                        {currentSession?.users.map(user => (
                            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {user.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user.dept}</p>
                                </div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '16px' }}>Session Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>ID:</span>
                            <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{sessionId.substring(0, 8)}...</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Created:</span>
                            <span style={{ fontWeight: '500' }}>{new Date(currentSession?.createdAt || '').toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default SessionFeed;
