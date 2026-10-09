import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import BrowsePage from './pages/BrowsePage';
import GigDetailPage from './pages/GigDetailPage';
import FreelancerDashboard from './pages/FreelancerDashboard';
import CreateGigPage from './pages/CreateGigPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import { authAPI, getToken, gigAPI, toGigView } from './services/api';

const initialUser = { name: '', role: 'guest', token: null, id: null };

export default function App() {
  const [page, setPage] = useState('landing');
  const [gigId, setGigId] = useState(null);
  const [user, setUser] = useState(initialUser);
  const [gigs, setGigs] = useState([]);
  const [notice, setNotice] = useState('');
  const [editingGig, setEditingGig] = useState(null);
  const [editGigLoading, setEditGigLoading] = useState(false);

  const refreshGigs = useCallback(async () => {
    try {
      setGigs((await gigAPI.list()).map(toGigView));
    } catch (error) {
      setNotice(error.message);
    }
  }, []);

  useEffect(() => { refreshGigs(); }, [refreshGigs]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    authAPI.me(token)
      .then((profile) => setUser({ ...profile, token }))
      .catch(() => authAPI.logout());
  }, []);

  useEffect(() => {
    const expireSession = () => {
      setUser(initialUser);
      setNotice('Your session expired. Please sign in again.');
      setPage('auth');
    };
    window.addEventListener('hustlehub:unauthorized', expireSession);
    return () => window.removeEventListener('hustlehub:unauthorized', expireSession);
  }, []);

  useEffect(() => {
    const targetRole = page === 'dashboard' || page === 'create-gig' || page === 'edit-gig' ? 'freelancer' : null;
    if (!targetRole || (user.token && user.role === targetRole)) return;
    setNotice(user.token ? `This page is for ${targetRole}s.` : 'Please sign in to continue.');
    setPage(user.token ? 'browse' : 'auth');
  }, [page, user]);

  const navigate = (target, id = null) => {
    if (id) setGigId(id);
    if (target === 'edit-gig' && id) {
      setEditingGig(null);
      setEditGigLoading(true);
      gigAPI.get(id)
        .then((record) => setEditingGig(toGigView(record)))
        .catch((error) => setNotice(error.message))
        .finally(() => setEditGigLoading(false));
    }
    setPage(target);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = ({ user: profile, token }) => {
    setUser({ ...profile, token });
    navigate(profile.role === 'freelancer' ? 'dashboard' : 'browse');
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(initialUser);
    navigate('landing');
  };

  const requireRole = (role) => {
    if (!user.token) {
      setNotice('Please sign in to continue.');
      setPage('auth');
      return false;
    }
    if (user.role !== role) {
      setNotice(`This page is for ${role}s.`);
      setPage(role === 'freelancer' ? 'dashboard' : 'browse');
      return false;
    }
    return true;
  };

  return (
    <div style={{ background: '#F3F2EA', minHeight: '100vh' }}>
      <Navbar currentPage={page} role={user.role} userName={user.name || ''}
        onNavigate={navigate} onLogout={handleLogout} />
      {notice && <div role="status" className="mx-auto max-w-7xl px-6 pt-16 text-sm" style={{ color: '#8E4A5A' }}>{notice}</div>}

      {page === 'landing' && <LandingPage gigs={gigs.slice(0, 3)} gigCount={gigs.length} onNavigate={navigate} />}
      {page === 'auth' && <AuthPage onLogin={handleLogin} />}
      {page === 'browse' && <BrowsePage gigs={gigs} onNavigate={navigate} />}
      {page === 'gig-detail' && <GigDetailPage gigId={gigId} gig={gigs.find((item) => item.id === gigId)}
        role={user.role} onNavigate={navigate} onRequireClient={() => requireRole('client')} />}
      {page === 'dashboard' && user.role === 'freelancer' && <FreelancerDashboard user={user} onNavigate={navigate} onRefreshGigs={refreshGigs} />}
      {page === 'create-gig' && user.role === 'freelancer' && <CreateGigPage onNavigate={navigate} onCreated={refreshGigs} />}
      {page === 'edit-gig' && user.role === 'freelancer' && (editGigLoading ? <p className="pt-24 text-center">Loading gig…</p> : editingGig ? <CreateGigPage gig={editingGig} onNavigate={navigate} onCreated={refreshGigs} /> : <p role="alert" className="pt-24 text-center">Gig could not be loaded.</p>)}
      {page === 'bookings' && user.token && <BookingsPage role={user.role} onNavigate={navigate} />}
      {page === 'profile' && user.token && <ProfilePage user={user} onNavigate={navigate} />}
    </div>
  );
}
