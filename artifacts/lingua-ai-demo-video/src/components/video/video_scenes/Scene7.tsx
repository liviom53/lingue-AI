import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Logo
      setTimeout(() => setPhase(2), 2000),  // Features
      setTimeout(() => setPhase(3), 5000),  // URL
      setTimeout(() => setPhase(4), 10000), // Final rock distortion
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0f172a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Background Distortion Effect */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={phase >= 4 ? {
          background: [
            "radial-gradient(circle at 50% 50%, rgba(251,146,60,0.2) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.4) 0%, transparent 60%)",
            "radial-gradient(circle at 50% 50%, rgba(251,146,60,0.2) 0%, transparent 50%)"
          ],
          filter: ["blur(0px)", "blur(10px)", "blur(0px)"],
          opacity: [0, 1, 0]
        } : { opacity: 0 }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* Huge Logo */}
      <motion.h1
        className="text-[15vw] font-black tracking-tighter text-white leading-none mb-[6vh]"
        initial={{ opacity: 0, scale: 3, filter: 'blur(30px)' }}
        animate={phase >= 1 ? { 
          opacity: 1, 
          scale: 1, 
          filter: 'blur(0px)',
          rotate: phase >= 4 ? [-1, 1, -2, 2, 0] : 0,
          textShadow: phase >= 4 ? '0 0 50px rgba(251,146,60,0.8), -10px 0 20px rgba(168,85,247,0.8), 10px 0 20px rgba(59,130,246,0.8)' : '0 0 30px rgba(251,146,60,0.4)'
        } : { opacity: 0, scale: 3, filter: 'blur(30px)' }}
        transition={{ 
          duration: 1, 
          type: "spring", 
          stiffness: 100,
          rotate: { duration: 0.1, repeat: Infinity }
        }}
      >
        LINGUE & AI
      </motion.h1>

      {/* Feature Badges */}
      <div className="flex gap-[2vw] mb-[8vh]">
        {['Gratis', 'Funziona offline', 'Installa come app'].map((text, i) => (
          <motion.div
            key={i}
            className="bg-white/10 border-[0.2vw] border-white/30 backdrop-blur-md px-[2vw] py-[2vh] rounded-[1vw] text-white text-[2vw] font-bold uppercase"
            initial={{ opacity: 0, y: '5vh' }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: '5vh' }}
            transition={{ type: "spring", stiffness: 300, delay: phase >= 2 ? i * 0.2 : 0 }}
            style={{ rotate: (i - 1) * 3 }}
          >
            {text}
          </motion.div>
        ))}
      </div>

      {/* URL Block */}
      <motion.div
        className="bg-gradient-to-r from-[#fb923c] via-[#a855f7] to-[#3b82f6] p-[0.3vw] rounded-[1.5vw]"
        initial={{ opacity: 0, scale: 0, y: '5vh' }}
        animate={phase >= 3 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0, y: '5vh' }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="bg-[#0f172a] px-[3vw] py-[2vh] rounded-[1.3vw]">
          <span className="text-[3vw] font-mono font-bold text-white tracking-tight">
            web-app-creator--liviomazzocchi.replit.app
          </span>
        </div>
      </motion.div>

    </motion.div>
  );
}
