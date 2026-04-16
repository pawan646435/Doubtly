// frontend/src/pages/HistoryPage/HistoryPage.jsx
// History page — browse and manage past doubts

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Clock,
  Search,
  Trash2,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  Type,
  Baby,
  Sparkles,
  Inbox,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { auth } from '../../firebase';
import { useDoubt } from '../../context/DoubtContext';
import ParticleBackground from '../../components/ParticleBackground/ParticleBackground';
import ResponseArea from '../../components/ResponseArea/ResponseArea';
import FollowUpChat from '../../components/FollowUpChat/FollowUpChat';
import './HistoryPage.css';

const categoryFilters = [
  { value: 'all', label: 'All' },
  { value: 'math', label: 'Math' },
  { value: 'coding', label: 'Coding' },
  { value: 'reasoning', label: 'Reasoning' },
  { value: 'science', label: 'Science' },
  { value: 'theory', label: 'Theory' },
  { value: 'general', label: 'General' },
];

const HistoryPage = () => {
  const {
    history,
    pagination,
    currentDoubt,
    loading,
    fetchHistory,
    loadDoubt,
    removeDoubt,
    clearHistory,
    clearCurrent,
  } = useDoubt();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getDoubtId = (doubt) => doubt?._id || doubt?.id || null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const loggedIn = Boolean(user);
      setIsLoggedIn(loggedIn);
      setAuthReady(true);

      if (!loggedIn) {
        clearHistory();
        clearCurrent();
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [clearCurrent, clearHistory, navigate]);

  useEffect(() => {
    if (!authReady || !isLoggedIn) return;
    fetchHistory({ category: selectedCategory });
  }, [authReady, isLoggedIn, selectedCategory, fetchHistory]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    clearCurrent();
  };

  const handleSelectDoubt = (id) => {
    if (!id) return;
    loadDoubt(id);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (deleteConfirm === id) {
      await removeDoubt(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const filteredHistory = searchQuery
    ? history.filter((d) =>
        d.questionText?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!authReady) {
    return (
      <div className="history-page">
        <ParticleBackground />
      </div>
    );
  }

  return (
    <div className="history-page">
      <ParticleBackground />

      <div className="container history-page__container">
        {/* ─── Header ──────────────────────────────────── */}
        <motion.div
          className="history-page__header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="history-page__title">
            <Clock size={28} />
            Doubt History
          </h1>
          <p className="history-page__subtitle">
            Browse and revisit your past questions and solutions
          </p>
        </motion.div>

        <div className="history-page__layout">
          {/* ─── Sidebar: List ─────────────────────────── */}
          <motion.div
            className="history-page__sidebar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Search */}
            <div className="history-page__search">
              <Search size={16} className="history-page__search-icon" />
              <input
                type="text"
                className="history-page__search-input input"
                placeholder="Search doubts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="history-search"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="history-page__search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="history-page__filters">
              <Filter size={14} />
              <div className="history-page__filter-pills">
                {categoryFilters.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`history-page__filter-pill ${
                      selectedCategory === cat.value ? 'history-page__filter-pill--active' : ''
                    }`}
                    onClick={() => handleCategoryChange(cat.value)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Doubt List */}
            <div className="history-page__list">
              {loading && history.length === 0 ? (
                <div className="history-page__loading">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={20} />
                  </motion.div>
                  <span>Loading history...</span>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="history-page__empty">
                  <Inbox size={32} />
                  <p>No doubts found</p>
                  <span>Start solving doubts and they'll appear here</span>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredHistory.map((doubt, index) => {
                    const doubtId = getDoubtId(doubt);
                    const isActive = getDoubtId(currentDoubt) === doubtId;

                    return (
                      <motion.div
                        key={doubtId || `history-${index}`}
                        className={`history-card ${isActive ? 'history-card--active' : ''}`}
                        onClick={() => handleSelectDoubt(doubtId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectDoubt(doubtId);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="history-card__content">
                          <div className="history-card__header">
                            <div className="history-card__badges">
                              {doubt.inputType === 'image' ? (
                                <span className="badge badge-violet" style={{ fontSize: '0.6rem', padding: '0.1em 0.4em' }}>
                                  <ImageIcon size={10} /> IMG
                                </span>
                              ) : (
                                <span className="badge badge-cyan" style={{ fontSize: '0.6rem', padding: '0.1em 0.4em' }}>
                                  <Type size={10} /> TXT
                                </span>
                              )}
                              {doubt.eli5Mode && (
                                <span className="badge badge-amber" style={{ fontSize: '0.6rem', padding: '0.1em 0.4em' }}>
                                  <Baby size={10} /> ELI5
                                </span>
                              )}
                            </div>
                            <span className="history-card__time">
                              {formatDate(doubt.createdAt)}
                            </span>
                          </div>

                          <p className="history-card__question">
                            {doubt.questionText.length > 120
                              ? doubt.questionText.substring(0, 120) + '...'
                              : doubt.questionText}
                          </p>

                          {doubt.finalAnswer && (
                            <p className="history-card__answer">
                              <CheckCircle size={12} />
                              {doubt.finalAnswer.length > 80
                                ? doubt.finalAnswer.substring(0, 80) + '...'
                                : doubt.finalAnswer}
                            </p>
                          )}
                        </div>

                        <div className="history-card__actions">
                          <button
                            type="button"
                            className={`history-card__delete ${
                              deleteConfirm === doubtId ? 'history-card__delete--confirm' : ''
                            }`}
                            onClick={(e) => handleDelete(e, doubtId)}
                            title={deleteConfirm === doubtId ? 'Click again to confirm' : 'Delete'}
                          >
                            {deleteConfirm === doubtId ? (
                              <AlertTriangle size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                          <ChevronRight size={16} className="history-card__chevron" />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Pagination Info */}
            {pagination && pagination.total > 0 && (
              <div className="history-page__pagination">
                <span>
                  Showing {filteredHistory.length} of {pagination.total} doubts
                </span>
              </div>
            )}
          </motion.div>

          {/* ─── Main: Detail View ─────────────────────── */}
          <motion.div
            className="history-page__detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {currentDoubt ? (
                <motion.div
                  key={getDoubtId(currentDoubt) || 'current-doubt'}
                  className="history-page__detail-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Original Question */}
                  <div className="history-page__original-question glass-card">
                    <div className="history-page__question-header">
                      <h3>Your Question</h3>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                        {new Date(currentDoubt.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="history-page__question-text">{currentDoubt.questionText}</p>
                  </div>

                  {/* AI Response */}
                  <ResponseArea doubt={currentDoubt} />

                  {/* Follow-up */}
                  <FollowUpChat doubtId={getDoubtId(currentDoubt)} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="history-page__detail-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Clock size={48} />
                  <h3>Select a doubt</h3>
                  <p>Choose a doubt from the list to view its full solution</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
