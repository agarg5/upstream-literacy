import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import MemberProfile from './pages/MemberProfile';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminModeration from './pages/admin/Moderation';
import { getMe, isLoggedIn, User } from './services/auth';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = () => {
    getMe().then(setUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isLoggedIn()) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={refreshUser} />} />
        <Route path="/register" element={<Register onRegister={refreshUser} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (user && !user.district_id && user.role !== 'admin') {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding user={user} onComplete={refreshUser} />} />
        <Route path="*" element={<Navigate to="/onboarding" />} />
      </Routes>
    );
  }

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Dashboard user={user!} />} />
        <Route path="/search" element={<Search user={user!} />} />
        <Route path="/members/:id" element={<MemberProfile user={user!} />} />
        <Route path="/messages" element={<Messages user={user!} />} />
        <Route path="/conversations/:id" element={<Conversation user={user!} />} />
        {user?.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/moderation" element={<AdminModeration user={user} />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
