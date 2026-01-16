import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Star, Eye, MessageSquare, Clock, Copy,
    ChevronLeft, Share2, Trash2, Loader2, Download, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import type { PromptCard, Photo, Comment } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { showToast, showConfirm } = useNotifications();

    const [card, setCard] = useState<PromptCard | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const hasIncremented = useRef(false);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [commentText, setCommentText] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            fetchData();
            if (!hasIncremented.current) {
                incrementViews();
                hasIncremented.current = true;
            }
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: promptData, error: promptError } = await supabase
                .from('prompts')
                .select('*')
                .eq('id', id)
                .single();

            if (promptError) throw promptError;
            setCard(promptData);

            const { data: photoData } = await supabase
                .from('photos')
                .select('*')
                .eq('prompt_id', id)
                .order('order', { ascending: true });
            setPhotos(photoData || []);

            const { data: commentData } = await supabase
                .from('comments')
                .select('*')
                .eq('prompt_id', id)
                .order('created_at', { ascending: false });
            setComments(commentData || []);

        } catch (error) {
            console.error('Error fetching card detail:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const incrementViews = async () => {
        if (id) {
            await supabase.rpc('increment_view_count', { prompt_id: id });
        }
    };

    const handleCopy = () => {
        if (card) {
            navigator.clipboard.writeText(card.prompt);
            showToast('Prompt copied to clipboard!', 'success');
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        showToast('Share link copied to clipboard!', 'success');
    };

    const handleDownloadPDF = async () => {
        if (!card) return;
        showToast('Generating PDF...', 'info');

        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header
            doc.setFillColor(15, 23, 42); // Navy background
            doc.rect(0, 0, pageWidth, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('Prompt Library - Official Post', 15, 25);

            // Body Content
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(18);
            doc.text(card.title, 15, 55);

            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Shared by: ${card.author_name} (${card.author_role})`, 15, 62);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 67);

            // Use Case Section
            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.text('Use-Case Scenario:', 15, 80);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            const useCaseLines = doc.splitTextToSize(card.use_case, pageWidth - 30);
            doc.text(useCaseLines, 15, 87);

            // Prompt Section
            const promptStartY = 87 + (useCaseLines.length * 6) + 10;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('System Prompt:', 15, promptStartY);

            doc.setFillColor(248, 250, 252);
            doc.rect(15, promptStartY + 5, pageWidth - 30, 120, 'F');

            doc.setFont('courier', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            const promptLines = doc.splitTextToSize(card.prompt, pageWidth - 40);
            doc.text(promptLines, 20, promptStartY + 15);

            // Footer
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text('Confidential - Internal Use Only', pageWidth / 2, 285, { align: 'center' });

            doc.save(`${card.title.replace(/\s+/g, '_')}_Prompt.pdf`);
            showToast('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF Error:', error);
            showToast('Failed to generate PDF', 'error');
        }
    };

    const handleDelete = () => {
        showConfirm({
            title: 'Delete Prompt?',
            message: 'This action cannot be undone. All data, photos, and ratings for this prompt will be permanently removed.',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    const { error } = await supabase.from('prompts').delete().eq('id', id);
                    if (error) throw error;
                    showToast('Prompt deleted successfully', 'success');
                    navigate('/');
                } catch (error: any) {
                    showToast(error.message || 'Failed to delete prompt', 'error');
                }
            }
        });
    };

    const submitRating = async (stars: number) => {
        setRating(stars);
        try {
            const { error } = await supabase.from('ratings').insert({
                prompt_id: id,
                stars: stars
            });
            if (error) throw error;
            fetchData();
            showToast('Thank you for rating!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to submit rating', 'error');
        }
    };

    const submitComment = async () => {
        if (!commentText.trim()) return;
        try {
            const { data, error } = await supabase.from('comments').insert({
                prompt_id: id,
                text: commentText,
                author_name: 'Guest'
            }).select();

            if (error) throw error;
            setComments([data[0], ...comments]);
            setCommentText('');
            fetchData();
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading details...</p>
            </div>
        );
    }

    if (!card) return null;

    const daysLeft = Math.ceil((new Date(card.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="fade-in">
            <button
                onClick={() => navigate('/')}
                style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}
            >
                <ChevronLeft size={20} />
                Back to Library
            </button>

            <div className="grid grid-cols-3" style={{ gap: '40px', alignItems: 'start' }}>
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div ref={contentRef}>
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                        {card.tags?.map(tag => (
                                            <span key={tag} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>#{tag}</span>
                                        ))}
                                    </div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>{card.title}</h1>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={handleShare} className="btn-secondary" style={{ padding: '8px' }} title="Copy Share Link">
                                        <Share2 size={20} />
                                    </button>
                                    <button onClick={handleDownloadPDF} className="btn-secondary" style={{ padding: '8px' }} title="Download PDF">
                                        <Download size={20} />
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={handleDelete}
                                            className="btn-secondary"
                                            style={{ padding: '8px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                            title="Delete Prompt"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="card-meta" style={{ marginBottom: '24px', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'white' }}>
                                        {card.author_name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span>{card.author_name} · <span style={{ color: 'var(--text-secondary)' }}>{card.author_role}</span></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={16} />
                                    <span>{daysLeft > 0 ? `Expires in ${daysLeft} days` : 'Expired'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Send size={16} style={{ transform: 'rotate(-45deg)', marginTop: '-2px' }} />
                                    <span>Posted on {new Date(card.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Eye size={16} />
                                    <span>{card.view_count || 0} views</span>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', background: 'rgba(255,255,255,0.02)' }}>
                                <h3 style={{ marginBottom: '12px', fontSize: '1.125rem' }}>Use-Case Scenario</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{card.use_case}</p>
                            </div>

                            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>System Prompt</span>
                                    <button onClick={handleCopy} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Copy size={14} />
                                        Copy Prompt
                                    </button>
                                </div>
                                <pre style={{
                                    padding: '24px',
                                    margin: '0',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9375rem',
                                    lineHeight: '1.6',
                                    color: '#e2e8f0',
                                    background: 'rgba(0,0,0,0.2)'
                                }}>
                                    {card.prompt}
                                </pre>
                            </div>
                        </section>
                    </div>

                    <section>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Proof Photos</h3>
                        <div className="grid grid-cols-2">
                            {photos.length > 0 ? photos.map(photo => (
                                <div key={photo.id} className="glass-card" style={{ height: '300px', padding: '0', overflow: 'hidden' }}>
                                    <img src={photo.url} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )) : (
                                <div className="glass-card" style={{ gridColumn: 'span 2', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No proof photos uploaded for this prompt.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div style={{ position: 'sticky', top: '120px' }}>
                    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>How helpful was this?</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => submitRating(star)}
                                    style={{ background: 'none' }}
                                >
                                    <Star
                                        size={32}
                                        fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                                        color={(hoverRating || rating) >= star ? '#f59e0b' : 'var(--text-secondary)'}
                                    />
                                </button>
                            ))}
                        </div>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Average rating: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{card.avg_rating?.toFixed(1) || '0.0'}</span> ({card.rating_count || 0} ratings)
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={20} />
                            Comments
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
                            {comments.length > 0 ? comments.map(c => (
                                <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                                        {c.author_name.substring(0, 1)}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{c.author_name}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{c.text}</p>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No comments yet.</p>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <textarea
                                placeholder="Add a comment..."
                                className="glass-input"
                                style={{ width: '100%', minHeight: '80px', paddingRight: '48px', fontSize: '0.875rem' }}
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                            />
                            <button
                                onClick={submitComment}
                                className="btn-primary"
                                style={{ position: 'absolute', right: '8px', bottom: '8px', padding: '6px', borderRadius: '8px' }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardDetail;
