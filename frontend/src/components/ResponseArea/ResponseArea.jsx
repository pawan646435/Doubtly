// /home/pawankumar/Desktop/Doubtly/frontend/src/components/ResponseArea/ResponseArea.jsx
// AI response display component with markdown rendering and animated sections

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  Lightbulb,
  CheckCircle,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Brain,
  Code2,
  Sigma,
  BrainCircuit,
  FlaskConical,
  LibraryBig,
} from 'lucide-react';
import './ResponseArea.css';

const responseModes = {
  coding: {
    label: 'Coding Mode',
    subtitle: 'Code-first answer with implementation and explanation',
    accent: 'coding',
    Icon: Code2,
    blueprint: ['Working code', 'Approach breakdown', 'Complexity and edge cases'],
  },
  math: {
    label: 'Math Mode',
    subtitle: 'Structured derivation with explicit steps',
    accent: 'math',
    Icon: Sigma,
    blueprint: ['Step-by-step solution', 'Formula intuition', 'Clear final result'],
  },
  reasoning: {
    label: 'Reasoning Mode',
    subtitle: 'Clue-by-clue deductions and logic flow',
    accent: 'reasoning',
    Icon: BrainCircuit,
    blueprint: ['Given clues', 'Deduction chain', 'Direct conclusion'],
  },
  science: {
    label: 'Science Mode',
    subtitle: 'Concept-first explanation with core principles',
    accent: 'science',
    Icon: FlaskConical,
    blueprint: ['Concept explanation', 'Underlying principle', 'Applied answer'],
  },
  theory: {
    label: 'Theory Mode',
    subtitle: 'Exam-ready explanation with supporting intuition',
    accent: 'theory',
    Icon: LibraryBig,
    blueprint: ['Structured notes', 'Real-world intuition', 'Short summary'],
  },
  general: {
    label: 'General Mode',
    subtitle: 'Clear explanation tailored to the question',
    accent: 'general',
    Icon: Sparkles,
    blueprint: ['Plain explanation', 'Key ideas', 'Focused answer'],
  },
};

const ResponseArea = ({ doubt }) => {
  const [copied, setCopied] = useState(false);

  if (!doubt) return null;

  const responseMode = responseModes[doubt.questionType] || responseModes[doubt.category] || responseModes.general;
  const ModeIcon = responseMode.Icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(doubt.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      className={`response-area response-area--${responseMode.accent}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      id="response-area"
    >
      <motion.div className="response-area__mode-card" variants={itemVariants}>
        <div className="response-area__mode-head">
          <div className="response-area__mode-icon">
            <ModeIcon size={20} />
          </div>
          <div className="response-area__mode-copy">
            <span className="response-area__mode-label">{responseMode.label}</span>
            <p className="response-area__mode-subtitle">{responseMode.subtitle}</p>
          </div>
          <span className="response-area__mode-pill">
            {(doubt.questionType || doubt.category || 'general').toUpperCase()}
          </span>
        </div>
        <div className="response-area__mode-blueprint">
          {responseMode.blueprint.map((item) => (
            <span key={item} className="response-area__mode-chip">
              {item}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Header */}
      <motion.div className="response-area__header" variants={itemVariants}>
        <div className="response-area__header-left">
          <div className="response-area__avatar">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="response-area__title">Doubtly AI</h3>
            <span className="response-area__subtitle">
              {doubt.eli5Mode ? `🧒 ELI5 ${responseMode.label}` : responseMode.subtitle}
            </span>
          </div>
        </div>
        <button
          className="response-area__copy btn btn-ghost"
          onClick={handleCopy}
          id="copy-response-btn"
          title="Copy response"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </motion.div>

      {/* Main Response */}
      <motion.div className="response-area__content glass-card" variants={itemVariants}>
        <div className="response-area__markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h2: ({ children }) => (
                <h2 className="response-area__section-title">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="response-area__section-subtitle">{children}</h3>
              ),
              code: ({ className, children, ...props }) => {
                const isBlock = /language-/.test(className || '');
                if (!isBlock) {
                  return (
                    <code className="response-area__inline-code" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="response-area__code-block">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              ol: ({ children }) => (
                <ol className="response-area__ordered-list">{children}</ol>
              ),
              ul: ({ children }) => (
                <ul className="response-area__unordered-list">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="response-area__list-item">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="response-area__blockquote">{children}</blockquote>
              ),
              strong: ({ children }) => (
                <strong className="response-area__bold">{children}</strong>
              ),
            }}
          >
            {doubt.response}
          </ReactMarkdown>
        </div>
      </motion.div>

      {/* Key Concepts */}
      {doubt.keyConcepts && doubt.keyConcepts.length > 0 && (
        <motion.div className="response-area__concepts" variants={itemVariants}>
          <div className="response-area__concepts-header">
            <Lightbulb size={18} />
            <h4>Key Concepts</h4>
          </div>
          <div className="response-area__concepts-grid">
            {doubt.keyConcepts.map((concept, index) => (
              <motion.div
                key={index}
                className="response-area__concept-chip"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <Brain size={12} />
                <span>{concept}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Final Answer */}
      {doubt.finalAnswer && (
        <motion.div className="response-area__final-answer" variants={itemVariants}>
          <div className="response-area__final-header">
            <CheckCircle size={18} />
            <h4>Final Answer</h4>
          </div>
          <p className="response-area__final-text">{doubt.finalAnswer}</p>
        </motion.div>
      )}

      {/* Practice Questions */}
      {doubt.practiceQuestions && doubt.practiceQuestions.length > 0 && (
        <motion.div className="response-area__practice" variants={itemVariants}>
          <div className="response-area__practice-header">
            <BookOpen size={18} />
            <h4>Practice Questions</h4>
          </div>
          <ol className="response-area__practice-list">
            {doubt.practiceQuestions.map((q, index) => (
              <motion.li
                key={index}
                className="response-area__practice-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                {q}
              </motion.li>
            ))}
          </ol>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResponseArea;
