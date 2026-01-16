import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface ModalConfig {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

interface NotificationContextType {
    showToast: (message: string, type?: NotificationType) => void;
    showConfirm: (config: ModalConfig) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Notification[]>([]);
    const [modal, setModal] = useState<ModalConfig | null>(null);

    const showToast = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const showConfirm = useCallback((config: ModalConfig) => {
        setModal(config);
    }, []);

    const closeModal = () => setModal(null);

    return (
        <NotificationContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast Container */}
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {toasts.map(toast => (
                    <div key={toast.id} className="glass-card fade-in" style={{
                        padding: '12px 20px',
                        minWidth: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#6366f1'}`,
                        background: 'rgba(15, 23, 42, 0.9)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}>
                        {toast.type === 'success' && <CheckCircle size={20} color="#10b981" />}
                        {toast.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
                        {toast.type === 'info' && <Info size={20} color="#6366f1" />}
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{toast.message}</span>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {modal && (
                <div className="fade-in" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                }}>
                    <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '32px', animation: 'scaleUp 0.3s ease-out' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' }}>{modal.title}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.5' }}>{modal.message}</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={closeModal}>
                                {modal.cancelText || 'Cancel'}
                            </button>
                            <button
                                className={modal.isDestructive ? 'btn-primary' : 'btn-primary'}
                                style={modal.isDestructive ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : {}}
                                onClick={() => {
                                    modal.onConfirm();
                                    closeModal();
                                }}
                            >
                                {modal.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};
