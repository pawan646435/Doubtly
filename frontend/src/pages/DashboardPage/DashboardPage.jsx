// frontend/src/pages/DashboardPage/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Clock, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, signOut } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ParticleBackground from '../../components/ParticleBackground/ParticleBackground';
import { useDoubt } from '../../context/DoubtContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { history, fetchHistory } = useDoubt();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchHistory();
      } else {
        navigate('/'); // Redirect to home if not logged in
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, fetchHistory]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <ParticleBackground />
        <div className="dashboard-page__container" style={{ alignItems: 'center', marginTop: '5rem' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <ParticleBackground />
      <div className="container dashboard-page__container">
        <motion.div
          className="dashboard-page__header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="dashboard-page__title">
            <User size={32} color="var(--primary-color)" />
            Account Dashboard
          </h1>
        </motion.div>

        <motion.div
          className="dashboard-card glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <img 
            src={user?.photoURL || 'https://via.placeholder.com/120'} 
            alt="Profile Avatar" 
            className="dashboard-avatar" 
          />
          
          <div className="dashboard-info">
            <h2>{user?.displayName || 'Doubtly User'}</h2>
            <p><Mail size={16} /> {user?.email}</p>
          </div>

          <div className="dashboard-stats">
            <div className="stat-item">
              <span className="stat-value">{history?.length || 0}</span>
              <span className="stat-label">Total Doubts Solved</span>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link to="/solve" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} /> Solve New Doubt
            </Link>
            <Link to="/history" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} /> View History
            </Link>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#f87171', color: '#f87171' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
