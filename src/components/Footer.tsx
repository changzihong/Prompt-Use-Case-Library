import logo from './image/kadosh_ai_logo.jpeg';

const Footer = () => {
    return (
        <footer style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: '12px 0',
            borderTop: '1px solid var(--glass-border)',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            textAlign: 'center'
        }}>
            <div className="container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
            }}>
                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    Copyright ©️ 2026 <img src={logo} alt="KadoshAI Logo" style={{ height: '14px', borderRadius: '2px' }} /> .KadoshAI All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
