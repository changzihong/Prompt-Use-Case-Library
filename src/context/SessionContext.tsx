import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SessionData, SessionUser, FeedItem, FeedItemType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

interface SessionContextType {
    sessionId: string | null;
    currentSession: SessionData | null;
    currentUser: SessionUser | null;
    allSessions: SessionData[];
    createSession: () => string;
    joinSession: (name: string, dept: string) => void;
    addFeedItem: (type: FeedItemType, title: string, useCase: string, prompt: string, imageUrl?: string, linkUrl?: string) => void;
    toggleLike: (itemId: string) => void;
    addComment: (itemId: string, text: string) => void;
    rateItem: (itemId: string, stars: number) => void;
    isUserInSession: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
    const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
    const [allSessions, setAllSessions] = useState<SessionData[]>([]);
    const { user: authUser } = useAuth();

    const getSessionKey = (id: string) => `feed_session_${id}`;
    const getUserKey = (id: string) => `feed_user_${id}`;
    const getSessionsListKey = () => authUser ? `feed_sessions_list_${authUser.id}` : 'feed_sessions_list';

    // Refresh all sessions
    const refreshAllSessions = useCallback(() => {
        const listKey = getSessionsListKey();
        const sessionIds = JSON.parse(localStorage.getItem(listKey) || '[]');
        const sessions = sessionIds.map((id: string) => {
            const data = localStorage.getItem(getSessionKey(id));
            return data ? JSON.parse(data) : null;
        }).filter(Boolean);
        setAllSessions(sessions);
    }, [authUser]);

    // Sync from localStorage
    const syncSession = useCallback((id: string) => {
        const stored = localStorage.getItem(getSessionKey(id));
        if (stored) {
            setCurrentSession(JSON.parse(stored));
        }
    }, []);

    // Initial load
    useEffect(() => {
        refreshAllSessions();
        const params = new URLSearchParams(window.location.search);
        const sId = params.get('session');

        // Auto-create first session if none exists and is admin
        const listKey = getSessionsListKey();
        const sessionIds = JSON.parse(localStorage.getItem(listKey) || '[]');
        if (sessionIds.length === 0 && authUser) {
            createSession();
        }

        if (sId) {
            setSessionId(sId);
            syncSession(sId);
            const userStored = localStorage.getItem(getUserKey(sId));
            if (userStored) setCurrentUser(JSON.parse(userStored));
        }
    }, [syncSession, refreshAllSessions]);

    // Listener for cross-tab sync
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === getSessionsListKey()) refreshAllSessions();
            if (sessionId && e.key === getSessionKey(sessionId)) syncSession(sessionId);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [sessionId, syncSession, refreshAllSessions]);

    const createSession = async () => {
        const id = uuidv4();
        const newSession: SessionData = {
            id,
            adminId: authUser?.id || 'admin',
            users: [],
            feed: [],
            createdAt: new Date().toISOString()
        };

        // 1. Sync to Supabase (if admin is logged in)
        if (authUser) {
            try {
                await supabase.from('sessions').insert({
                    id: id,
                    admin_id: authUser.id
                });
            } catch (err) {
                console.error('Failed to sync session to Supabase:', err);
            }
        }

        // 2. Save session data locally
        localStorage.setItem(getSessionKey(id), JSON.stringify(newSession));

        // 3. Update sessions index
        const listKey = getSessionsListKey();
        const sessionIds = JSON.parse(localStorage.getItem(listKey) || '[]');
        localStorage.setItem(listKey, JSON.stringify([...sessionIds, id]));

        setSessionId(id);
        setCurrentSession(newSession);
        refreshAllSessions();

        window.dispatchEvent(new Event('storage'));
        return id;
    };

    const joinSession = (name: string, dept: string) => {
        if (!sessionId) return;

        const newUser: SessionUser = {
            id: uuidv4(),
            name,
            dept,
            joinedAt: new Date().toISOString()
        };

        const sessionToUpdate = currentSession || {
            id: sessionId,
            adminId: 'admin',
            users: [],
            feed: [],
            createdAt: new Date().toISOString()
        };

        const updatedSession = {
            ...sessionToUpdate,
            users: [...sessionToUpdate.users, newUser]
        };

        localStorage.setItem(getSessionKey(sessionId), JSON.stringify(updatedSession));
        localStorage.setItem(getUserKey(sessionId), JSON.stringify(newUser));

        setCurrentSession(updatedSession);
        setCurrentUser(newUser);

        // Notify other tabs
        window.dispatchEvent(new Event('storage'));
    };

    const addFeedItem = (type: FeedItemType, title: string, useCase: string, prompt: string, imageUrl?: string, linkUrl?: string) => {
        if (!sessionId || !currentSession || !currentUser) return;

        const newItem: FeedItem = {
            id: uuidv4(),
            sessionId,
            type,
            title,
            useCase,
            prompt,
            imageUrl,
            linkUrl,
            authorName: currentUser.name,
            authorDept: currentUser.dept,
            createdAt: new Date().toISOString(),
            likes: 0,
            ratings: [],
            comments: []
        };

        const updatedSession = {
            ...currentSession,
            feed: [newItem, ...currentSession.feed]
        };

        localStorage.setItem(getSessionKey(sessionId), JSON.stringify(updatedSession));
        setCurrentSession(updatedSession);
        window.dispatchEvent(new Event('storage'));
    };

    const toggleLike = (itemId: string) => {
        if (!sessionId || !currentSession) return;

        const updatedFeed = currentSession.feed.map(item => {
            if (item.id === itemId) return { ...item, likes: item.likes + 1 };
            return item;
        });

        const updatedSession = { ...currentSession, feed: updatedFeed };
        localStorage.setItem(getSessionKey(sessionId), JSON.stringify(updatedSession));
        setCurrentSession(updatedSession);
        window.dispatchEvent(new Event('storage'));
    };

    const addComment = (itemId: string, text: string) => {
        if (!sessionId || !currentSession || !currentUser) return;

        const updatedFeed = currentSession.feed.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    comments: [...item.comments, {
                        id: uuidv4(),
                        authorName: currentUser.name,
                        text,
                        createdAt: new Date().toISOString()
                    }]
                };
            }
            return item;
        });

        const updatedSession = { ...currentSession, feed: updatedFeed };
        localStorage.setItem(getSessionKey(sessionId), JSON.stringify(updatedSession));
        setCurrentSession(updatedSession);
        window.dispatchEvent(new Event('storage'));
    };

    const rateItem = (itemId: string, stars: number) => {
        if (!sessionId || !currentSession) return;

        const updatedFeed = currentSession.feed.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    ratings: [...item.ratings, stars]
                };
            }
            return item;
        });

        const updatedSession = { ...currentSession, feed: updatedFeed };
        localStorage.setItem(getSessionKey(sessionId), JSON.stringify(updatedSession));
        setCurrentSession(updatedSession);
        window.dispatchEvent(new Event('storage'));
    };

    const isUserInSession = !!currentUser;

    return (
        <SessionContext.Provider value={{
            sessionId,
            currentSession,
            currentUser,
            allSessions,
            createSession,
            joinSession,
            addFeedItem,
            toggleLike,
            addComment,
            rateItem,
            isUserInSession
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error('useSession must be used within SessionProvider');
    return context;
};
