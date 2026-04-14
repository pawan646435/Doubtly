// /home/pawankumar/Desktop/Doubtly/frontend/src/components/Navbar/Navbar.jsx
// Navigation bar component with glassy design and animated logo

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Zap, Menu, X, Code } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    { path: '/history', label: 'History', icon: Clock },
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

        {/* CTA Button */}
        <Link to="/solve" className="navbar__cta btn btn-primary" id="navbar-solve-btn">
          <Zap size={16} />
          Solve Now
        </Link>

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
            <Link to="/solve" className="navbar__mobile-cta btn btn-primary">
              <Zap size={16} />
              Solve Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
