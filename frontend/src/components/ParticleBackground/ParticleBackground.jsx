// /home/pawankumar/Desktop/Doubtly/frontend/src/components/ParticleBackground/ParticleBackground.jsx
// Animated particle/orb background for atmospheric depth

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import './ParticleBackground.css';

const ParticleBackground = () => {
  // Generate random orbs
  const orbs = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      size: 200 + Math.random() * 400,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'violet' : 'amber',
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="particle-bg" aria-hidden="true">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`particle-bg__orb particle-bg__orb--${orb.color}`}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
          }}
          animate={{
            x: [0, 50, -30, 20, 0],
            y: [0, -30, 40, -20, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* Grid overlay */}
      <div className="particle-bg__grid" />
    </div>
  );
};

export default ParticleBackground;
