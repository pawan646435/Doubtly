// frontend/src/pages/SolverPage/SolverPage.jsx
// Main doubt solver page — input, solve, and display results

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Type,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  AlertTriangle,
  X,
  Baby,
  LogIn,
  User,
} from 'lucide-react';
import { useDoubt } from '../../context/DoubtContext';
import { auth, googleProvider, signInWithPopup } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import ResponseArea from '../../components/ResponseArea/ResponseArea';
import FollowUpChat from '../../components/FollowUpChat/FollowUpChat';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ParticleBackground from '../../components/ParticleBackground/ParticleBackground';
import './SolverPage.css';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'math', label: 'Math' },
  { value: 'coding', label: 'Coding' },
  { value: 'reasoning', label: 'Reasoning' },
  { value: 'science', label: 'Science' },
  { value: 'theory', label: 'Theory' },
];

const SolverPage = () => {
  const { solveDoubt, currentDoubt, solving, error, clearError, clearCurrent } = useDoubt();

  // Clear any existing active doubt from other pages when entering
  useEffect(() => {
    clearCurrent();
  }, [clearCurrent]);

  const [questionText, setQuestionText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [eli5Mode, setEli5Mode] = useState(false);
  const [category, setCategory] = useState('general');
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'image'
  const [user, setUser] = useState(null);
  const [allowGuestSolve, setAllowGuestSolve] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const responseRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAllowGuestSolve(false);
        setShowAuthPrompt(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const canSubmit = (inputMode === 'text' && questionText.trim().length >= 3) ||
    (inputMode === 'image' && selectedImage !== null) ||
    (questionText.trim().length >= 3 && selectedImage !== null);

  const performSolve = async () => {
    if (!canSubmit || solving) return;

    try {
      await solveDoubt({
        questionText: questionText.trim() || undefined,
        image: selectedImage || undefined,
        eli5Mode,
        category,
      });

      // Scroll to response
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch {
      // Error is handled by context
    }
  };

  const handleSolve = async () => {
    if (solving) return;

    if (!user && !allowGuestSolve) {
      setShowAuthPrompt(true);
      return;
    }

    if (!canSubmit) {
      alert("Please enter a question or upload an image first.");
      return;
    }

    await performSolve();
  };

  const handleLoginAndSolve = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthPrompt(false);
      await performSolve();
    } catch (loginError) {
      console.error('Google sign-in error', loginError);
    }
  };

  const handleContinueAsGuest = async () => {
    setAllowGuestSolve(true);
    setShowAuthPrompt(false);
    await performSolve();
  };

  const handleNewDoubt = () => {
    clearCurrent();
    setQuestionText('');
    setSelectedImage(null);
    setEli5Mode(false);
    setCategory('general');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadingMessages = [
    'Analyzing your question...',
    'Generating step-by-step solution...',
    'Extracting key concepts...',
    'Almost done...',
  ];

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (!solving) {
      setLoadingMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [solving]);

  return (
    <div className="solver-page">
      <ParticleBackground />

      <div className="container solver-page__container">
        {/* ─── Page Header ─────────────────────────────────── */}
        <motion.div
          className="solver-page__header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="solver-page__title">
            <Sparkles size={28} className="solver-page__title-icon" />
            Solve Your Doubt
          </h1>
          <p className="solver-page__subtitle">
            Upload an image or type your question below
          </p>
          <div className="solver-page__format-hint">
            Answers adapt to the question type: code-first for programming, step-by-step for math,
            logic breakdowns for reasoning, and structured concept notes for theory/science.
          </div>
        </motion.div>

        {/* ─── Input Section ───────────────────────────────── */}
        <motion.div
          className="solver-page__input-section glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Input Mode Toggle */}
          <div className="solver-page__mode-toggle">
            <button
              className={`solver-page__mode-btn ${inputMode === 'text' ? 'solver-page__mode-btn--active' : ''}`}
              onClick={() => setInputMode('text')}
              id="mode-text-btn"
            >
              <Type size={16} />
              Type Question
            </button>
            <button
              className={`solver-page__mode-btn ${inputMode === 'image' ? 'solver-page__mode-btn--active' : ''}`}
              onClick={() => setInputMode('image')}
              id="mode-image-btn"
            >
              <ImageIcon size={16} />
              Upload Image
            </button>
          </div>

          {/* Text Input */}
          <AnimatePresence mode="wait">
            {inputMode === 'text' ? (
              <motion.div
                key="text-input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <textarea
                  className="input solver-page__textarea"
                  placeholder="Type or paste your question here... (e.g., 'What is the derivative of sin(x)?')"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  disabled={solving}
                  id="question-input"
                  rows={5}
                />
              </motion.div>
            ) : (
              <motion.div
                key="image-input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ImageUpload
                  onImageSelect={setSelectedImage}
                  disabled={solving}
                />
                {/* Optional text alongside image */}
                <textarea
                  className="input solver-page__textarea solver-page__textarea--small"
                  placeholder="Add context or additional details (optional)..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  disabled={solving}
                  rows={2}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options Row */}
          <div className="solver-page__options">
            {/* Category Select */}
            <div className="solver-page__option-group">
              <label className="solver-page__option-label">Category</label>
              <div className="solver-page__category-pills">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    className={`solver-page__category-pill ${
                      category === cat.value ? 'solver-page__category-pill--active' : ''
                    }`}
                    onClick={() => setCategory(cat.value)}
                    disabled={solving}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ELI5 Toggle */}
            <div className="solver-page__option-group">
              <button
                className={`solver-page__eli5-toggle ${eli5Mode ? 'solver-page__eli5-toggle--active' : ''}`}
                onClick={() => setEli5Mode(!eli5Mode)}
                disabled={solving}
                id="eli5-toggle-btn"
              >
                {eli5Mode ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                <Baby size={16} />
                ELI5 Mode
              </button>
            </div>
          </div>

          {/* Solve Button */}
          <motion.button
            className="btn btn-primary solver-page__solve-btn"
            onClick={handleSolve}
            disabled={solving}
            whileHover={!solving ? { scale: 1.02 } : {}}
            whileTap={!solving ? { scale: 0.98 } : {}}
            id="solve-btn"
          >
            <Zap size={20} />
            {solving ? 'Solving...' : 'Solve My Doubt'}
          </motion.button>
        </motion.div>

        {/* ─── Login Or Guest Prompt ─────────────────────── */}
        <AnimatePresence>
          {showAuthPrompt && (
            <motion.div
              className="solver-page__auth-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="solver-page__auth-modal glass-card"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="solver-page__auth-title">Continue to solve your doubt</h3>
                <p className="solver-page__auth-subtitle">
                  Login to save your progress and access history, or continue as guest.
                </p>

                <div className="solver-page__auth-actions">
                  <button
                    className="btn btn-primary solver-page__auth-btn"
                    onClick={handleLoginAndSolve}
                    type="button"
                  >
                    <LogIn size={16} />
                    Login with Google
                  </button>

                  <button
                    className="btn btn-secondary solver-page__auth-btn"
                    onClick={handleContinueAsGuest}
                    type="button"
                  >
                    <User size={16} />
                    Continue as Guest
                  </button>
                </div>

                <button
                  className="solver-page__auth-close"
                  onClick={() => setShowAuthPrompt(false)}
                  type="button"
                >
                  Not now
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Error Display ───────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="solver-page__error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button className="solver-page__error-close" onClick={clearError}>
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Loading State ───────────────────────────────── */}
        <AnimatePresence>
          {solving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner
                message={loadingMessages[loadingMsgIndex]}
                submessage="This may take a moment"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Response Area ───────────────────────────────── */}
        <div ref={responseRef}>
          <AnimatePresence>
            {currentDoubt && !solving && (
              <motion.div
                className="solver-page__response-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ResponseArea doubt={currentDoubt} />

                {/* Follow-up Chat */}
                <FollowUpChat doubtId={currentDoubt.id || currentDoubt._id} />

                {/* New Doubt Button */}
                <motion.button
                  className="btn btn-secondary solver-page__new-doubt-btn"
                  onClick={handleNewDoubt}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="new-doubt-btn"
                >
                  <Zap size={16} />
                  Solve Another Doubt
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SolverPage;
