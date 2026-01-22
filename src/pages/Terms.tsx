import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Lock, Globe, Scale } from 'lucide-react';

const Terms = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: <Globe size={24} />,
            title: "1. Acceptance of Terms",
            content: "By accessing and using KadoshAI, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services."
        },
        {
            icon: <FileText size={24} />,
            title: "2. Use of Prompts",
            content: "The prompts provided in this library are for educational and professional enhancement. While we strive for high quality, KadoshAI does not guarantee specific outcomes from the use of any AI prompts."
        },
        {
            icon: <Shield size={24} />,
            title: "3. Intellectual Property",
            content: "All prompts shared within the platform remain the intellectual property of their respective authors. By posting, users grant KadoshAI a non-exclusive license to display and distribute the content for library purposes."
        },
        {
            icon: <Lock size={24} />,
            title: "4. User Responsibility",
            content: "Users are responsible for ensuring that their contributions do not contain sensitive, private, or copyrighted information. Misuse of the platform for generating harmful or illegal content is strictly prohibited."
        },
        {
            icon: <Scale size={24} />,
            title: "5. Limitation of Liability",
            content: "KadoshAI shall not be held liable for any direct or indirect damages arising from the use of the platform or the reliance on any content provided within the library."
        }
    ];

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '40px auto 100px' }}>
            <button
                onClick={() => navigate(-1)}
                className="btn-secondary"
                style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <ArrowLeft size={18} /> Back
            </button>

            <div className="glass-card" style={{ padding: '60px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px' }}>Terms & Conditions</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Last updated: January 2026</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {sections.map((section, index) => (
                        <div key={index} style={{ display: 'flex', gap: '24px' }}>
                            <div style={{
                                color: 'var(--primary)',
                                background: 'rgba(99, 102, 241, 0.1)',
                                padding: '12px',
                                borderRadius: '12px',
                                height: 'fit-content'
                            }}>
                                {section.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' }}>{section.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{section.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '60px',
                    padding: '32px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    border: '1px solid var(--glass-border)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Questions about these terms? Reach out to us at <span style={{ color: 'var(--primary)' }}>legal@kadoshai.com</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
