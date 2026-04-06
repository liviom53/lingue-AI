import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),   // Title enters
      setTimeout(() => setPhase(2), 800),   // Original text box
      setTimeout(() => setPhase(3), 1800),  // Scanning effect
      setTimeout(() => setPhase(4), 2400),  // Translation box
      setTimeout(() => setPhase(5), 3200),  // Audio wave
      setTimeout(() => setPhase(6), 4400),  // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-20"
      initial={{ opacity: 0, x: '20vw' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-20vw', filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-full max-w-5xl flex gap-12 items-center">
        
        {/* Left side: Content */}
        <div className="flex-1 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[4vw] font-black leading-tight text-white mb-4">
              Traduzione <span className="text-[#3b82f6]">Istantanea</span>
            </h2>
            <p className="text-[1.8vw] text-white/70">
              Da qualsiasi lingua. Con pronuncia nativa perfetta.
            </p>
          </motion.div>

          {/* Audio Waveform visualization */}
          <motion.div 
            className="flex items-center gap-2 h-16"
            initial={{ opacity: 0 }}
            animate={phase >= 5 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" className="text-white">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </div>
            <div className="flex gap-1 items-center h-full ml-4">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-[#3b82f6] rounded-full"
                  animate={phase >= 5 ? {
                    height: ['20%', '80%', '40%', '100%', '30%'][i % 5]
                  } : { height: '10%' }}
                  transition={{ 
                    duration: 0.5 + (Math.random() * 0.5), 
                    repeat: Infinity, 
                    repeatType: "mirror" 
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right side: UI Mockup */}
        <div className="flex-1 relative">
          
          {/* Original Text */}
          <motion.div
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl relative z-10"
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
              <span className="text-[#94a3b8] text-sm font-medium">Italiano</span>
              <div className="w-6 h-4 bg-white/20 rounded" />
            </div>
            <p className="text-[1.8vw] font-medium">Ho perso il treno, possiamo vederci più tardi?</p>
          </motion.div>

          {/* Connection line */}
          <motion.div 
            className="absolute left-1/2 -ml-[1px] w-[2px] bg-gradient-to-b from-[#3b82f6]/50 to-[#a855f7]/50"
            initial={{ height: 0, top: '40%' }}
            animate={phase >= 3 ? { height: '30%', top: '40%' } : { height: 0, top: '40%' }}
            transition={{ duration: 0.6 }}
          />

          {/* Scanning particle */}
          <motion.div
            className="absolute left-1/2 -ml-2 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_#3b82f6] z-20"
            initial={{ opacity: 0, top: '40%' }}
            animate={phase >= 3 ? { opacity: [0, 1, 0], top: ['40%', '70%'] } : { opacity: 0, top: '40%' }}
            transition={{ duration: 0.6 }}
          />

          {/* Translated Text */}
          <motion.div
            className="bg-[#a855f7]/20 backdrop-blur-xl border border-[#a855f7]/40 p-6 rounded-2xl shadow-2xl relative mt-8 z-10"
            initial={{ opacity: 0, y: -20, rotateX: -10 }}
            animate={phase >= 4 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: -20, rotateX: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center justify-between mb-4 border-b border-[#a855f7]/20 pb-2">
              <span className="text-[#d8b4fe] text-sm font-medium">Inglese</span>
              <div className="w-6 h-4 bg-[#a855f7]/40 rounded" />
            </div>
            <p className="text-[1.8vw] font-medium text-white">I missed the train, can we meet later?</p>
            
            {/* Audio highlight effect */}
            <motion.div 
              className="absolute inset-0 bg-[#a855f7]/20 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={phase >= 5 ? { opacity: [0, 0.5, 0] } : { opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
