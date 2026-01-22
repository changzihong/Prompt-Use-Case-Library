import { Link } from 'react-router-dom';
import { Library, BarChart3, Users, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

const LandingPage = () => {
    const { isAdmin } = useAuth();
    const { allSessions } = useSession();

    // Get the most recent session
    const latestSession = allSessions.length > 0 ? allSessions[allSessions.length - 1] : null;
    const sessionUrl = latestSession ? `/library?session=${latestSession.id}` : '/dashboard';

    return (
        <div className="landing-page fade-in">
            {/* Hero Section */}
            <section style={{
                padding: '100px 0 80px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
                    zIndex: -1,
                    pointerEvents: 'none'
                }}></div>



                <h1 style={{
                    fontSize: '4.5rem',
                    fontWeight: '900',
                    marginBottom: '24px',
                    letterSpacing: '-0.04em',
                    lineHeight: '1.1',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Unlock the Power <br />
                    of <span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>Expert Prompts</span>
                </h1>

                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1.4rem',
                    maxWidth: '800px',
                    margin: '0 auto 48px',
                    lineHeight: '1.6'
                }}>
                    The central repository for high-performance AI prompts. Shared by experts,
                    validated by the community, and ready for your next project.
                </p>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    {isAdmin ? (
                        <>
                            <Link to={sessionUrl} className="btn-primary" style={{
                                padding: '16px 32px',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
                            }}>
                                Enter Workspace <ArrowRight size={20} />
                            </Link>
                            <Link to="/dashboard" className="btn-secondary" style={{
                                padding: '16px 32px',
                                fontSize: '1.1rem'
                            }}>
                                Admin Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/admin/login" className="btn-primary" style={{
                                padding: '16px 32px',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
                            }}>
                                Get Started <ArrowRight size={20} />
                            </Link>
                        </>
                    )}
                </div>
            </section>

            {/* Stats / Features Grid */}
            <section style={{ padding: '80px 0' }}>
                <div className="grid grid-cols-3" style={{ gap: '32px' }}>
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: 'var(--primary)'
                        }}>
                            <Library size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Curated Library</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            A vast collection of prompts categorized by industry, task, and complexity.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: 'var(--success)'
                        }}>
                            <Star size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Community Rated</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Every prompt is tested and rated by users to ensure only the highest quality results.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: 'var(--accent)'
                        }}>
                            <BarChart3 size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Advanced Analytics</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Insights into prompt usage, performance trends, and discovery metrics.
                        </p>
                    </div>
                </div>
            </section>

            {/* Role Highlight Section */}
            <section style={{
                padding: '100px 0',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '48px',
                border: '1px solid var(--glass-border)',
                marginBottom: '80px',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '60px', letterSpacing: '-0.02em' }}>
                        Built for Teams & Individual Experts
                    </h2>

                    <div className="grid grid-cols-3" style={{ gap: '32px' }}>
                        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                                <ShieldCheck size={40} />
                            </div>
                            <h4 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '12px' }}>Admin Controlled</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                Dedicated admin space for library management and deep analytics.
                            </p>
                        </div>

                        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                                <Users size={40} />
                            </div>
                            <h4 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '12px' }}>Universal Access</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                Multiple users can view, use, and rate prompts without friction.
                            </p>
                        </div>

                        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                                <Zap size={40} />
                            </div>
                            <h4 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '12px' }}>Fast Discovery</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                Smart filtering and AI-powered help to find exactly what you need.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
