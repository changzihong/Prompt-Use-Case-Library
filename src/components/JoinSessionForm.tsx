import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { User, Briefcase, Send } from 'lucide-react';

const JoinSessionForm = () => {
    const { joinSession } = useSession();
    const [name, setName] = useState('');
    const [dept, setDept] = useState('');

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && dept) {
            joinSession(name, dept);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '500px', margin: '60px auto' }}>
            <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px' }}>Join <span style={{ color: 'var(--primary)' }}>Session</span></h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome! Please introduce yourself to join the collaboration space.</p>
                </div>

                <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <User size={16} /> Full Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Jane Cooper"
                            className="glass-input"
                            style={{ width: '100%' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <Briefcase size={16} /> Department / Position
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Marketing Manager"
                            className="glass-input"
                            style={{ width: '100%' }}
                            value={dept}
                            onChange={(e) => setDept(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ height: '56px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        Join Collaboration <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinSessionForm;
