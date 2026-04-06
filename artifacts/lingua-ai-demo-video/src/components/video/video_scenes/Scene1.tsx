import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),   // AI badge
      setTimeout(() => setPhase(2), 800),   // Lingua AI logo text
      setTimeout(() => setPhase(3), 1600),  // Impara una lingua...
      setTimeout(() => setPhase(4), 2600),  // Inizia a parlarla male
      setTimeout(() => setPhase(5), 3800),  // Exit drift
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top AI Badge */}
      <motion.div
        className="px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-8 flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="w-2 h-2 rounded-full bg-[#fb923c] animate-pulse" />
        <span className="text-[1vw] font-medium tracking-widest uppercase text-white/80">Powered by DeepSeek</span>
      </motion.div>

      {/* Main Logo Text */}
      <div className="relative mb-6">
        <motion.h1 
          className="text-[8vw] font-black tracking-tighter leading-none text-white text-gradient"
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          Lingua AI
        </motion.h1>
      </div>

      {/* Tagline Part 1 */}
      <motion.p 
        className="text-[2.5vw] font-medium text-white/90"
        initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
        animate={phase >= 3 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(5px)' }}
        transition={{ duration: 0.6 }}
      >
        Impara una lingua con l'AI
      </motion.p>

      {/* Tagline Part 2 */}
      <motion.div
        className="mt-4 relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <span className="text-[3vw] font-bold text-white bg-white/10 px-6 py-3 rounded-2xl border border-white/20 inline-block rotate-2">
          "Inizia a parlarla male... poi si vedrà"
        </span>
      </motion.div>

      {/* Decorative floating languages */}
      <div className="absolute inset-0 pointer-events-none">
        {['Hello', 'Hola', 'Ciao', 'Bonjour', 'Hallo', '你好', 'こんにちは'].map((word, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10 font-bold text-[4vw]"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { 
              opacity: [0, 0.2, 0],
              y: [0, -100],
              x: Math.sin(i) * 50
            } : { opacity: 0 }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: i * 0.4,
              ease: "linear"
            }}
            style={{
              left: `${15 + (i * 12)}%`,
              top: `${40 + (i % 3) * 20}%`
            }}
          >
            {word}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
