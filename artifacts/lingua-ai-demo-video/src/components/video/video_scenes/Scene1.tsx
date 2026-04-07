import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Badge
      setTimeout(() => setPhase(2), 1500),  // Title explosive
      setTimeout(() => setPhase(3), 3500),  // Tagline
      setTimeout(() => setPhase(4), 6000),  // Floating words start moving faster
      setTimeout(() => setPhase(5), 11000), // Exit drift
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top AI Badge */}
      <motion.div
        className="px-6 py-2 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-xl mb-12 flex items-center gap-3 shadow-[0_0_30px_rgba(251,146,60,0.4)]"
        initial={{ opacity: 0, y: -50, scale: 0.5 }}
        animate={phase >= 1 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -50, scale: 0.5 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <div className="w-3 h-3 rounded-full bg-[#fb923c] animate-pulse" />
        <span className="text-[1.5vw] font-bold tracking-widest uppercase text-white">Powered by DeepSeek AI</span>
      </motion.div>

      {/* Main Logo Text Explosive */}
      <div className="relative mb-10">
        <motion.h1 
          className="text-[12vw] font-black tracking-tight leading-none text-white"
          initial={{ opacity: 0, scale: 0.2, filter: 'blur(20px)' }}
          animate={phase >= 2 ? { 
            opacity: 1, 
            scale: 1, 
            filter: 'blur(0px)',
            rotate: [-5, 5, -2, 2, 0] // subtle shake
          } : { opacity: 0, scale: 0.2, filter: 'blur(20px)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            textShadow: phase >= 2 ? '0 0 50px rgba(168,85,247,0.8), 0 0 100px rgba(59,130,246,0.6)' : 'none'
          }}
        >
          LINGUE & AI
        </motion.h1>
      </div>

      {/* Tagline */}
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 40 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 1, type: "spring" }}
      >
        <p className="text-[3vw] font-bold text-white/90">
          Impara una lingua con l'AI
        </p>
        <div className="bg-[#fb923c] text-[#0f172a] px-8 py-3 rounded-xl rotate-[-2deg] shadow-xl">
          <span className="text-[2.5vw] font-black uppercase">
            Inizia a parlarla male... poi si vedrà
          </span>
        </div>
      </motion.div>

      {/* Decorative floating languages */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['Hola', 'Bonjour', 'Hallo', 'Ciao', 'こんにちは', '你好', 'Привет', 'Привет'].map((word, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10 font-black text-[6vw]"
            initial={{ opacity: 0, scale: 0 }}
            animate={phase >= 2 ? { 
              opacity: [0, 0.3, 0],
              scale: phase >= 4 ? [1, 2] : [0.5, 1],
              x: phase >= 4 ? (Math.random() - 0.5) * 400 : (Math.random() - 0.5) * 100,
              y: phase >= 4 ? (Math.random() - 0.5) * 400 : (Math.random() - 0.5) * 100,
              rotate: (Math.random() - 0.5) * 90
            } : { opacity: 0, scale: 0 }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity, 
              delay: i * 0.3,
            }}
            style={{
              left: `${10 + (i * 10)}%`,
              top: `${20 + (i % 4) * 20}%`
            }}
          >
            {word}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
