// frontend/src/pages/HomePage/HomePage.jsx
// Landing page with hero section, feature cards, and CTA

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Camera,
  Brain,
  MessageSquare,
  Lightbulb,
  GraduationCap,
  ArrowRight,
  Sparkles,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import ParticleBackground from '../../components/ParticleBackground/ParticleBackground';
import './HomePage.css';

const features = [
  {
    icon: Camera,
    title: 'Snap & Solve',
    description: 'Upload a photo of any question. Our OCR instantly extracts text and solves it.',
    color: 'cyan',
  },
  {
    icon: Brain,
    title: 'AI-Powered Answers',
    description: 'Get detailed step-by-step explanations from advanced AI models.',
    color: 'violet',
  },
  {
    icon: MessageSquare,
    title: 'Follow-up Chat',
    description: "Didn't understand something? Ask follow-up questions for deeper clarity.",
    color: 'amber',
  },
  {
    icon: Lightbulb,
    title: 'ELI5 Mode',
    description: 'Toggle "Explain Like I\'m 5" for simpler explanations using everyday examples.',
    color: 'emerald',
  },
  {
    icon: BookOpen,
    title: 'Practice Questions',
    description: 'Get similar practice problems to strengthen your understanding.',
    color: 'violet',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Review your past doubts and solutions anytime in the history panel.',
    color: 'cyan',
  },
];

const subjects = [
  { name: 'Mathematics', emoji: '📐' },
  { name: 'Physics', emoji: '⚡' },
  { name: 'Chemistry', emoji: '🧪' },
  { name: 'Coding', emoji: '💻' },
  { name: 'Biology', emoji: '🧬' },
  { name: 'History', emoji: '📜' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const HomePage = () => {
  return (
    <div className="home-page">
      <ParticleBackground />

      {/* ════════════════════ HERO SECTION ════════════════════ */}
      <motion.section
        className="hero"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container hero__container">
          {/* Floating Badge */}
          <motion.div
            className="hero__badge badge badge-cyan"
            variants={itemVariants}
          >
            <Sparkles size={12} />
            AI-Powered Learning
          </motion.div>

          {/* Main Headline */}
          <motion.h1 className="hero__title" variants={itemVariants}>
            Your Doubts,
            <br />
            <span className="gradient-text">Solved Instantly.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p className="hero__subtitle" variants={itemVariants}>
            Upload an image or type any question — math, coding, science, or theory.
            <br />
            Get crystal-clear, step-by-step AI explanations in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className="hero__actions" variants={itemVariants}>
            <Link to="/solve" className="btn btn-primary hero__cta" id="hero-solve-btn">
              <Zap size={18} />
              Start Solving
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Subject Pills */}
          <motion.div className="hero__subjects" variants={itemVariants}>
            <span className="hero__subjects-label">Works with:</span>
            <div className="hero__subjects-list">
              {subjects.map(({ name, emoji }) => (
                <motion.span
                  key={name}
                  className="hero__subject-pill"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {emoji} {name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hero Glow Effect */}
        <div className="hero__glow" aria-hidden="true" />
      </motion.section>

      {/* ════════════════════ FEATURES SECTION ════════════════════ */}
      <motion.section
        className="features section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <div className="container">
          <motion.div className="features__header" variants={itemVariants}>
            <span className="badge badge-violet">
              <GraduationCap size={12} />
              Features
            </span>
            <h2 className="features__title">
              Everything you need to
              <span className="gradient-text"> ace your studies</span>
            </h2>
            <p className="features__subtitle">
              Doubtly combines cutting-edge AI with intuitive design to make learning effortless.
            </p>
          </motion.div>

          <div className="features__grid">
            {features.map(({ icon: Icon, title, description, color }, index) => (
              <motion.div
                key={title}
                className="feature-card glass-card"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className={`feature-card__icon feature-card__icon--${color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="feature-card__title">{title}</h3>
                <p className="feature-card__description">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════════════════════ HOW IT WORKS ════════════════════ */}
      <motion.section
        className="how-it-works section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <div className="container">
          <motion.div className="how-it-works__header" variants={itemVariants}>
            <span className="badge badge-amber">
              <Zap size={12} />
              How it works
            </span>
            <h2 className="how-it-works__title">
              Three steps to
              <span className="gradient-text"> clarity</span>
            </h2>
          </motion.div>

          <div className="how-it-works__steps">
            {[
              { step: '01', title: 'Upload or Type', desc: 'Snap a photo of your question or type it directly into the input field.' },
              { step: '02', title: 'AI Processes', desc: 'Our AI extracts text via OCR (if image), analyzes the question, and generates a solution.' },
              { step: '03', title: 'Learn & Grow', desc: 'Get a step-by-step breakdown, key concepts, and practice questions to master the topic.' },
            ].map(({ step, title, desc }, index) => (
              <motion.div
                key={step}
                className="step-card"
                variants={itemVariants}
              >
                <span className="step-card__number gradient-text">{step}</span>
                <h3 className="step-card__title">{title}</h3>
                <p className="step-card__desc">{desc}</p>
                {index < 2 && <div className="step-card__connector" aria-hidden="true" />}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════════════════════ CTA SECTION ════════════════════ */}
      <motion.section
        className="cta-section section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="container">
          <motion.div className="cta-card glass-card" variants={itemVariants}>
            <div className="cta-card__glow" aria-hidden="true" />
            <h2 className="cta-card__title">
              Ready to solve your first doubt?
            </h2>
            <p className="cta-card__subtitle">
              Join thousands of students who are learning smarter with AI.
            </p>
            <Link to="/solve" className="btn btn-primary cta-card__btn" id="cta-solve-btn">
              <Zap size={18} />
              Get Started Free
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <Sparkles size={16} />
            <span className="gradient-text">Doubtly</span>
          </div>
          <p className="footer__copy">
            © {new Date().getFullYear()} Doubtly. AI-powered learning for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
