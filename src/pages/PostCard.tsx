import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, Shield, CheckCircle, Loader2, User, Briefcase } from 'lucide-react';
import { safetyCheck } from '../lib/openai';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../context/NotificationContext';
import { useSession } from '../context/SessionContext';
import JoinSessionForm from '../components/JoinSessionForm';

const PostCard = () => {
    const navigate = useNavigate();
    const { showToast } = useNotifications();
    const { isUserInSession, currentUser, sessionId } = useSession();
    const sessionQuery = sessionId ? `?session=${sessionId}` : '';
    const [loading, setLoading] = useState(false);
    const [safetyStatus, setSafetyStatus] = useState<'idle' | 'checking' | 'safe' | 'blocked'>('idle');
    const [formData, setFormData] = useState({
        title: '',
        useCase: '',
        prompt: '',
        authorName: currentUser?.name || '',
        authorRole: currentUser?.dept || '',
        tags: [] as string[]
    });
    const [issues, setIssues] = useState<string[]>([]);
    const [photos, setPhotos] = useState<File[]>([]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setPhotos(prev => [...prev, ...selectedFiles].slice(0, 2));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId) {
            showToast('You cannot post without an active session.', 'error');
            return;
        }
        setLoading(true);
        setSafetyStatus('checking');

        try {
            // 0. Compulsory photo check
            if (photos.length === 0) {
                showToast('Please upload at least one proof screenshot of the prompt output.', 'error');
                setLoading(false);
                return;
            }

            // 1. Safety Check
            const check = await safetyCheck(formData.title, formData.useCase, formData.prompt);

            if (!check.safe) {
                setSafetyStatus('blocked');
                setIssues(check.issues);
                setLoading(false);
                return;
            }

            setSafetyStatus('safe');
            const finalTags = check.suggestedTags;

            // 2. Submit to Supabase
            const { data, error } = await supabase.from('prompts').insert([
                {
                    title: formData.title,
                    use_case: formData.useCase,
                    prompt: formData.prompt,
                    author_name: formData.authorName,
                    author_role: formData.authorRole,
                    tags: finalTags,
                    session_id: sessionId
                }
            ]).select();

            if (error) throw error;

            const promptId = data[0].id;

            // 3. Upload Photos (if any)
            if (photos.length > 0) {
                for (let i = 0; i < photos.length; i++) {
                    const file = photos[i];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${promptId}_${i}.${fileExt}`;
                    const filePath = `proofs/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('prompts')
                        .upload(filePath, file);

                    if (uploadError) {
                        console.error('Photo upload error:', uploadError);
                        showToast(`Photo upload failed: ${uploadError.message}`, 'error');
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from('prompts')
                            .getPublicUrl(filePath);

                        await supabase.from('photos').insert({
                            prompt_id: promptId,
                            url: publicUrl,
                            order: i + 1
                        });
                    }
                }
            }

            setLoading(false);
            navigate('/library' + sessionQuery);

        } catch (error: any) {
            console.error(error);
            setSafetyStatus('blocked');
            setIssues([error.message || 'An unexpected error occurred.']);
            setLoading(false);
        }
    };

    if (!sessionId) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Shield size={48} color="var(--danger)" style={{ marginBottom: '24px' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Post <span style={{ color: 'var(--danger)' }}>Restricted</span></h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
                    You must join a session to contribute to the prompt library.
                </p>
                <div style={{ marginTop: '32px' }}>
                    <Link to={`/library${sessionQuery}`} className="btn-secondary">Return to Library</Link>
                </div>
            </div>
        );
    }

    if (!isUserInSession) {
        return <JoinSessionForm />;
    }

    return (
        <div className="fade-in">
            <section style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '12px' }}>Share New <span style={{ color: 'var(--primary)' }}>Prompt Case</span></h1>
                <p style={{ color: 'var(--text-secondary)' }}>Contribute to the library and help your teammates work smarter.</p>
            </section>

            <div className="glass-card" style={{ padding: '32px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={16} /> Your Name
                            </label>
                            <input
                                type="text"
                                required
                                readOnly={!!currentUser}
                                placeholder="e.g. John Doe"
                                className="glass-input"
                                style={currentUser ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                value={formData.authorName}
                                onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={16} /> Job Position
                            </label>
                            <input
                                type="text"
                                required
                                readOnly={!!currentUser}
                                placeholder="e.g. Senior Marketing Manager"
                                className="glass-input"
                                style={currentUser ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                value={formData.authorRole}
                                onChange={e => setFormData({ ...formData, authorRole: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '500' }}>Title <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-secondary)' }}>(max 60 chars)</span></label>
                        <input
                            type="text"
                            required
                            maxLength={60}
                            placeholder="e.g. Weekly Report Summarizer"
                            className="glass-input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '500' }}>Use-case Scenario</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="What problem does this prompt solve?"
                            className="glass-input"
                            style={{ resize: 'vertical' }}
                            value={formData.useCase}
                            onChange={e => setFormData({ ...formData, useCase: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '500' }}>The Prompt</label>
                        <textarea
                            required
                            rows={8}
                            placeholder="Paste your high-performance prompt here..."
                            className="glass-input"
                            style={{ resize: 'vertical', fontFamily: 'monospace' }}
                            value={formData.prompt}
                            onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Upload size={18} /> Proof of Quality
                        </label>
                        <div style={{
                            border: '2px dashed var(--glass-border)',
                            borderRadius: '16px',
                            padding: '32px',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer'
                        }} onClick={() => document.getElementById('photo-upload')?.click()}>
                            <input
                                id="photo-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePhotoUpload}
                            />
                            <div style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                <Upload size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                                <p>Upload screenshots showing the prompt output (max 2)</p>
                            </div>
                            {photos.length > 0 && (
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                                    {photos.map((f, i) => (
                                        <div key={i} style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                            {f.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        {safetyStatus === 'checking' && (
                            <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', textAlign: 'center', borderColor: 'var(--primary)' }}>
                                <Loader2 className="animate-spin" size={24} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                                <p>AI is verifying your prompt for safety and quality...</p>
                            </div>
                        )}

                        {safetyStatus === 'blocked' && (
                            <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)' }}>
                                <h4 style={{ color: 'var(--danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Shield size={18} /> Safety Check Failed
                                </h4>
                                <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                </ul>
                            </div>
                        )}

                        {safetyStatus === 'safe' && (
                            <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)' }}>
                                <p style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={18} /> Safety check passed! Tagging with metadata...
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', height: '56px', fontSize: '1.1rem', gap: '12px' }}
                        >
                            {loading ? <><Loader2 className="animate-spin" size={20} /> Publishing...</> : 'Publish to Library'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostCard;
