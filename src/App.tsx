import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import PostCard from './pages/PostCard';
import CardDetail from './pages/CardDetail';
import Dashboard from './pages/Dashboard';
import SessionFeed from './pages/SessionFeed';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import ForgotPassword from './pages/ForgotPassword';
import Leadership from './pages/Leadership';
import Terms from './pages/Terms';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SessionProvider } from './context/SessionContext';
import './index.css';

function App() {
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');



  return (
    <AuthProvider>
      <NotificationProvider>
        <SessionProvider>
          <Router>
            <div className="min-h-screen" style={{ display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <main className="container pb-32" style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/library" element={
                    <Home
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                    />
                  } />
                  <Route path="/post" element={<PostCard />} />
                  <Route path="/card/:id" element={<CardDetail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/live-feed" element={<SessionFeed />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/leadership" element={<Leadership />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/signup" element={<AdminSignup />} />
                  <Route path="/admin/forgot-password" element={<ForgotPassword />} />
                  <Route path="/terms" element={<Terms />} />
                </Routes>
              </main>

              <Footer />


            </div>
          </Router>
        </SessionProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
