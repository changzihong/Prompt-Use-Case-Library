import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostCard from './pages/PostCard';
import CardDetail from './pages/CardDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import ForgotPassword from './pages/ForgotPassword';
import AIChatbot from './components/AIChatbot';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { supabase } from './lib/supabase';
import type { PromptCard } from './types';
import './index.css';

function App() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [allPrompts, setAllPrompts] = useState<PromptCard[]>([]);

  // AI filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [aiFilterIds, setAiFilterIds] = useState<string[]>([]);
  const [isAiFiltering, setIsAiFiltering] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase.from('prompts').select('*');
      setAllPrompts(data || []);
    };
    fetchAll();
  }, []);

  const handleChatbotFilter = (ids: string[], search: string) => {
    if (ids.length > 0) {
      setAiFilterIds(ids);
      setIsAiFiltering(true);
      setSearchTerm('');
    } else if (search) {
      setSearchTerm(search);
      setIsAiFiltering(false);
    }
  };

  const clearAiFilter = () => {
    setIsAiFiltering(false);
    setAiFilterIds([]);
    setSearchTerm('');
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen" style={{ display: 'flex', flexDirection: 'column' }}>
            <Navbar onToggleAssistant={() => setIsAiOpen(!isAiOpen)} />
            <main className="container pb-20" style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={
                  <Home
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    aiFilterIds={aiFilterIds}
                    isAiFiltering={isAiFiltering}
                    setIsAiFiltering={setIsAiFiltering}
                    clearAiFilter={clearAiFilter}
                  />
                } />
                <Route path="/post" element={<PostCard />} />
                <Route path="/card/:id" element={<CardDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/signup" element={<AdminSignup />} />
                <Route path="/admin/forgot-password" element={<ForgotPassword />} />
              </Routes>
            </main>

            <Footer />

            <AIChatbot
              isOpen={isAiOpen}
              onClose={() => setIsAiOpen(false)}
              availablePrompts={allPrompts}
              onFilter={handleChatbotFilter}
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
