// frontend/src/components/FollowUpChat/FollowUpChat.jsx
// Follow-up conversation chat component

import { useState, useRef, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageCircle, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { useDoubt } from '../../context/DoubtContext';
import './FollowUpChat.css';

const FollowUpChat = ({ doubtId }) => {
  const { currentDoubt, askFollowUp, followUpLoading } = useDoubt();
  const [question, setQuestion] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const followUps = currentDoubt?.followUps || [];

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [followUps.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || followUpLoading) return;

    const q = question.trim();
    setQuestion('');
    await askFollowUp(doubtId, q);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="followup-chat" id="followup-chat">
      {/* Toggle Button */}
      <motion.button
        className={`followup-chat__toggle btn ${isOpen ? 'btn-secondary' : 'btn-primary'}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 300);
        }}
        whileTap={{ scale: 0.95 }}
        id="followup-toggle-btn"
      >
        <MessageCircle size={18} />
        {isOpen ? 'Close Chat' : 'Ask Follow-up'}
        {followUps.length > 0 && (
          <span className="followup-chat__count badge badge-cyan">{followUps.length}</span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="followup-chat__panel glass-card"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Messages */}
            <div className="followup-chat__messages">
              {followUps.length === 0 && (
                <div className="followup-chat__empty">
                  <MessageCircle size={24} />
                  <p>Ask a follow-up question about this explanation</p>
                </div>
              )}

              {followUps.map((fu, index) => (
                <Fragment key={index}>
                  {/* User Message */}
                  <motion.div
                    className="followup-chat__message followup-chat__message--user"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="followup-chat__bubble followup-chat__bubble--user">
                      <p>{fu.question}</p>
                    </div>
                    <div className="followup-chat__avatar followup-chat__avatar--user">
                      <User size={14} />
                    </div>
                  </motion.div>

                  {/* AI Message */}
                  <motion.div
                    className="followup-chat__message followup-chat__message--ai"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="followup-chat__avatar followup-chat__avatar--ai">
                      <Sparkles size={14} />
                    </div>
                    <div className="followup-chat__bubble followup-chat__bubble--ai">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {fu.answer}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                </Fragment>
              ))}

              {/* Loading indicator */}
              {followUpLoading && (
                <motion.div
                  className="followup-chat__message followup-chat__message--ai"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="followup-chat__avatar followup-chat__avatar--ai">
                    <Sparkles size={14} />
                  </div>
                  <div className="followup-chat__bubble followup-chat__bubble--ai followup-chat__typing">
                    <Loader2 size={16} className="followup-chat__spinner" />
                    <span>Thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form className="followup-chat__input-area" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="followup-chat__input input"
                placeholder="Ask a follow-up question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={followUpLoading}
                id="followup-input"
              />
              <button
                type="submit"
                className="followup-chat__send btn btn-primary"
                disabled={!question.trim() || followUpLoading}
                id="followup-send-btn"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowUpChat;
