import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Shield, CheckCircle, Loader2, User, Briefcase } from 'lucide-react';
import { safetyCheck } from '../lib/openai';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../context/NotificationContext';

const PostCard = () => {
    const navigate = useNavigate();
    const { showToast } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [safetyStatus, setSafetyStatus] = useState<'idle' | 'checking' | 'safe' | 'blocked'>('idle');
    const [formData, setFormData] = useState({
        title: '',
        useCase: '',
        prompt: '',
        authorName: '',
        authorRole: '',
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
        setLoading(true);
        setSafetyStatus('checking');

        try {
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
                    tags: finalTags
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
            navigate('/');

        } catch (error: any) {
            console.error(error);
            setSafetyStatus('blocked');
            setIssues([error.message || 'An unexpected error occurred.']);
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <section style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>Share a <span style={{ color: 'var(--primary)' }}>New Prompt Case</span></h1>
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
                                placeholder="e.g. John Doe"
                                className="glass-input"
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
                                placeholder="e.g. Senior Marketing Manager"
                                className="glass-input"
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
                            rows={6}
                            placeholder="Paste your prompt here..."
                            className="glass-input"
                            style={{ resize: 'vertical', fontFamily: 'monospace' }}
                            value={formData.prompt}
                            onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ fontWeight: '500' }}>Proof Photos (Max 2)</label>
                        <div style={{
                            border: '2px dashed var(--glass-border)',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer'
                        }} onClick={() => document.getElementById('photo-upload')?.click()}>
                            <Upload size={32} style={{ marginBottom: '12px', color: 'var(--primary)' }} />
                            <p style={{ fontSize: '0.875rem' }}>Click to upload screenshots</p>
                            <input
                                type="file"
                                id="photo-upload"
                                multiple
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePhotoUpload}
                            />
                        </div>
                        {photos.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {photos.map((photo, i) => (
                                    <div key={i} style={{ fontSize: '0.75rem', background: 'var(--glass-bg)', padding: '4px 12px', borderRadius: '8px' }}>{photo.name}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {safetyStatus !== 'idle' && (
                        <div style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: safetyStatus === 'checking' ? 'rgba(99, 102, 241, 0.1)' : safetyStatus === 'blocked' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            border: `1px solid ${safetyStatus === 'checking' ? 'var(--primary)' : safetyStatus === 'blocked' ? 'var(--danger)' : 'var(--success)'}`,
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <div>
                                {safetyStatus === 'checking' && <Loader2 className="animate-spin" size={20} />}
                                {safetyStatus === 'blocked' && <Shield color="var(--danger)" size={20} />}
                                {safetyStatus === 'safe' && <CheckCircle color="var(--success)" size={20} />}
                            </div>
                            <div>
                                <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                    {safetyStatus === 'checking' && 'Running AI Safety Check...'}
                                    {safetyStatus === 'blocked' && 'Safety Check Blocked'}
                                    {safetyStatus === 'safe' && 'Safety Check Passed'}
                                </p>
                                {safetyStatus === 'blocked' && (
                                    <ul style={{ fontSize: '0.8125rem', marginTop: '4px', paddingLeft: '16px' }}>
                                        {issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Shield size={18} />}
                            {loading ? (safetyStatus === 'checking' ? 'Checking Safety...' : 'Submitting...') : 'Verify & Submit'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostCard;
