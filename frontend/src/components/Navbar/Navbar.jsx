// frontend/src/components/Navbar/Navbar.jsx
// Navigation bar component with glassy design and animated logo

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Zap, Menu, X, Code, LogIn, LogOut } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useDoubt } from '../../context/DoubtContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { clearHistory, clearCurrent } = useDoubt();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearHistory();
      clearCurrent();
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/solve', label: 'Solve', icon: Zap },
    { path: '/coding', label: 'Coding', icon: Code },
    ...(user ? [{ path: '/history', label: 'History', icon: Clock }] : []),
  ];

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar__inner container">
        {/* Logo — Animated SVG */}
        <Link to="/" className="navbar__logo" id="navbar-logo">
          <img
            src="/logo-animated.svg"
            alt="Doubtly"
            className="navbar__logo-svg"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar__links">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`navbar__link ${location.pathname === path ? 'navbar__link--active' : ''}`}
              id={`nav-link-${label.toLowerCase()}`}
            >
              <Icon size={16} />
              <span>{label}</span>
              {location.pathname === path && (
                <motion.div
                  className="navbar__link-indicator"
                  layoutId="navbar-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Actions Container */}
        <div className="navbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
          {/* Auth Button */}
          {user ? (
            <Link to="/dashboard" className="navbar__cta btn btn-primary" id="navbar-solve-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src={user.photoURL} alt={user.displayName} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
              {user.displayName || 'Account'}
            </Link>
          ) : (
            <button onClick={handleLogin} className="navbar__cta btn btn-primary" id="navbar-login-btn">
              <LogIn size={16} />
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="navbar__mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          id="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`navbar__mobile-link ${
                  location.pathname === path ? 'navbar__mobile-link--active' : ''
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}

            {user ? (
              <Link to="/dashboard" className="navbar__mobile-cta btn btn-primary" onClick={() => setMobileOpen(false)}>
                <img src={user.photoURL} alt={user.displayName} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                {user.displayName || 'Account'}
              </Link>
            ) : (
              <button
                className="navbar__mobile-cta btn btn-primary"
                onClick={() => { handleLogin(); setMobileOpen(false); }}
              >
                <LogIn size={18} />
                Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
