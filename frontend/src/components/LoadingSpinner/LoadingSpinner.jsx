// frontend/src/components/LoadingSpinner/LoadingSpinner.jsx
// Premium loading spinner with orbital animation

import { motion } from 'framer-motion';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Processing your doubt...', submessage = '' }) => {
  return (
    <div className="loading-spinner" id="loading-spinner">
      <div className="loading-spinner__orbitals">
        {/* Outer ring */}
        <motion.div
          className="loading-spinner__ring loading-spinner__ring--outer"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="loading-spinner__dot loading-spinner__dot--cyan" />
        </motion.div>

        {/* Inner ring */}
        <motion.div
          className="loading-spinner__ring loading-spinner__ring--inner"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="loading-spinner__dot loading-spinner__dot--violet" />
        </motion.div>

        {/* Center pulse */}
        <motion.div
          className="loading-spinner__center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className="loading-spinner__message"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>

      {submessage && (
        <motion.p
          className="loading-spinner__submessage"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {submessage}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
