import logo from './image/kadosh_ai_logo.jpeg';

const Footer = () => {
    return (
        <footer style={{
            padding: '40px 0',
            marginTop: '80px',
            borderTop: '1px solid var(--glass-border)',
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(10px)'
        }}>
            <div className="container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: 0.8
                }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Powered by</span>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <img
                            src={logo}
                            alt="Kadosh AI Logo"
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                objectFit: 'cover'
                            }}
                        />
                        <span style={{
                            fontWeight: '700',
                            fontSize: '1rem',
                            letterSpacing: '0.5px',
                            color: 'var(--text-primary)'
                        }}>
                            Kadosh AI
                        </span>
                    </div>
                </div>
                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    opacity: 0.5
                }}>
                    © {new Date().getFullYear()} PromptLib. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
