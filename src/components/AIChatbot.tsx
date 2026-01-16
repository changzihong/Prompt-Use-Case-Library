import { useRef, useEffect, useState } from 'react';
import { X, Send, Loader2, Bot } from 'lucide-react';
import { findPrompts } from '../lib/openai';
import { useNotifications } from '../context/NotificationContext';

interface AIChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    availablePrompts: any[];
    onFilter: (ids: string[], searchTerm: string) => void;
}

const AIChatbot = ({ isOpen, onClose, availablePrompts, onFilter }: AIChatbotProps) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
        { role: 'bot', text: 'Hi! I can help you find the perfect prompt. What are you trying to achieve today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { showToast } = useNotifications();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const result = await findPrompts(userMsg, availablePrompts);

            setMessages(prev => [...prev, {
                role: 'bot',
                text: result.answer
            }]);

            if (result.recommendedIds && result.recommendedIds.length > 0) {
                onFilter(result.recommendedIds, result.suggestedSearch || '');
                showToast(`Found ${result.recommendedIds.length} matches!`, 'success');
            } else if (result.suggestedSearch) {
                onFilter([], result.suggestedSearch);
            }

        } catch (error: any) {
            showToast('Chatbot error: ' + error.message, 'error');
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="glass-card fade-in"
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '25px',
                width: '360px',
                height: '520px',
                zIndex: 3000,
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                background: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                animation: 'scaleUp 0.3s ease-out'
            }}
        >
            {/* Header */}
            <div style={{
                padding: '20px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={20} color="white" />
                    </div>
                    <span style={{ fontWeight: '700' }}>AI Assistant</span>
                </div>
                <button onClick={onClose} style={{ background: 'none', color: 'var(--text-secondary)', padding: '4px' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    padding: '20px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}
            >
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        fontSize: '0.875rem',
                        lineHeight: '1.5'
                    }}>
                        {msg.text}
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '16px 16px 16px 0' }}>
                        <Loader2 size={18} className="animate-spin" color="var(--primary)" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Ask for a prompt..."
                        className="glass-input"
                        style={{ width: '100%', paddingRight: '48px', fontSize: '0.875rem', background: 'rgba(15, 23, 42, 0.8)' }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            color: input.trim() ? 'var(--primary)' : 'var(--text-secondary)',
                            cursor: 'pointer'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scaleUp {
                    from { transform: translateY(20px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AIChatbot;
