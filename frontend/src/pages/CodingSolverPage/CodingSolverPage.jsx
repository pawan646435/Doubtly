// /home/pawankumar/Desktop/Doubtly/frontend/src/pages/CodingSolverPage/CodingSolverPage.jsx
// Coding doubt solver — supports text and image input, uses Kimi backend

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, X, Code2 } from 'lucide-react';
import ParticleBackground from '../../components/ParticleBackground/ParticleBackground';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ResponseArea from '../../components/ResponseArea/ResponseArea';
import FollowUpChat from '../../components/FollowUpChat/FollowUpChat';
import { useDoubt } from '../../context/DoubtContext';
import './CodingSolverPage.css';

const CodingSolverPage = () => {
  const { solveDoubt, currentDoubt, solving, error, clearError, clearCurrent } = useDoubt();
  const [query, setQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [localError, setLocalError] = useState('');

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const adjustTextareaHeight = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleTextChange = (e) => {
    setQuery(e.target.value);
    adjustTextareaHeight(e);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      setLocalError('Invalid file type. Please upload an image (PNG, JPG, WebP).');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setLocalError('Image is too large. Max size is 10MB.');
      return;
    }

    setSelectedImage(file);
    setLocalError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canSubmit = query.trim().length >= 3 || selectedImage !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || solving) return;

    setLocalError('');
    clearError();

    try {
      await solveDoubt({
        questionText: query.trim() || undefined,
        image: selectedImage || undefined,
        category: 'coding',
        eli5Mode: false,
      });

      // Reset form on success
      setQuery('');
      setSelectedImage(null);
      setImagePreview(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setLocalError(err.response?.data?.error || err.message || 'Failed to analyze code. Please check your logic and try again.');
    }
  };

  const handleNewQuery = () => {
    clearCurrent();
    setQuery('');
    setSelectedImage(null);
    setImagePreview(null);
    setLocalError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayError = localError || error;

  return (
    <div className="coding-page">
      <ParticleBackground />

      <main className="coding-main">
        <motion.div
          className="hero-section text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge kimi-badge">Powered by NVIDIA Kimi</div>
          <h1 className="hero-title gradient-text">Coding Assistant</h1>
          <p className="hero-subtitle">
            Paste your code, upload screenshots, or describe algorithms. Get intelligent explanations and debugging help.
          </p>
        </motion.div>

        <motion.div
          className="workspace-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form className="query-box" onSubmit={handleSubmit}>
            <div className="coding-input-wrapper">
              <div className="editor-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="file-name">query.js</span>
              </div>
              <textarea
                ref={textareaRef}
                className="coding-textarea"
                placeholder="// Paste your code, describe a bug, or ask a programming question..."
                value={query}
                onChange={handleTextChange}
                disabled={solving}
                spellCheck="false"
              />
            </div>

            {/* Image Upload Section */}
            <div className="coding-image-section">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                onChange={handleImageSelect}
                className="coding-image-input-hidden"
                id="coding-image-input"
                disabled={solving}
              />

              <AnimatePresence mode="wait">
                {imagePreview ? (
                  <motion.div
                    className="coding-image-preview"
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <img src={imagePreview} alt="Code screenshot" className="coding-image-preview__img" />
                    <button
                      type="button"
                      className="coding-image-preview__remove"
                      onClick={removeImage}
                      disabled={solving}
                    >
                      <X size={16} />
                    </button>
                    <div className="coding-image-preview__label">
                      <ImageIcon size={14} />
                      <span>Screenshot attached</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.label
                    htmlFor="coding-image-input"
                    className="coding-image-upload-btn"
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload size={18} />
                    <span>Upload Code Screenshot</span>
                    <span className="coding-image-upload-hint">PNG, JPG, WebP up to 10MB</span>
                  </motion.label>
                )}
              </AnimatePresence>
            </div>

            <div className="submit-actions">
              <button
                type="submit"
                className="coding-submit-btn"
                disabled={solving || !canSubmit}
              >
                {solving ? (
                  <span className="btn-content">
                    <Code2 size={18} className="coding-spin" /> Processing...
                  </span>
                ) : (
                  <span className="btn-content">
                    <Code2 size={18} /> Run Analysis
                  </span>
                )}
              </button>
            </div>
          </form>

          {displayError && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              ⚠ {displayError}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {solving && !currentDoubt && (
              <motion.div
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingSpinner />
                <p className="loading-text">Kimi is analyzing your code...</p>
              </motion.div>
            )}

            {currentDoubt && !solving && (
              <motion.div
                className="results-container"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Original Question Display */}
                <div className="coding-original-question glass-card">
                  <div className="coding-original-question__header">
                    <Code2 size={16} />
                    <h3>Your Question</h3>
                    <span className="badge kimi-badge" style={{ margin: 0, padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}>
                      {currentDoubt.questionType || 'coding'}
                    </span>
                  </div>
                  <pre className="coding-original-question__code">
                    <code>{currentDoubt.questionText}</code>
                  </pre>
                  {currentDoubt.inputType === 'image' && currentDoubt.imagePath && (
                    <div className="coding-original-question__image">
                      <img src={`/uploads/${currentDoubt.imagePath}`} alt="Uploaded code" />
                    </div>
                  )}
                </div>

                <ResponseArea doubt={currentDoubt} />

                <div className="follow-up-section">
                  <FollowUpChat doubtId={currentDoubt.id || currentDoubt._id} />
                </div>

                <motion.button
                  className="btn btn-secondary coding-new-query-btn"
                  onClick={handleNewQuery}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Code2 size={16} />
                  New Code Analysis
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default CodingSolverPage;
