import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Quiz Card
      setTimeout(() => setPhase(2), 2000),  // Options
      setTimeout(() => setPhase(3), 4000),  // Correct Answer
      setTimeout(() => setPhase(4), 7000),  // Bookmark
      setTimeout(() => setPhase(5), 11000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, x: '100vw' }}
      transition={{ duration: 1, type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="w-full max-w-[70vw] relative">
        {/* Quiz Title */}
        <motion.div
          className="absolute -top-[12vh] left-0"
          initial={{ opacity: 0, y: '-5vh' }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: '-5vh' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[4vw] font-black leading-none text-white uppercase drop-shadow-lg">
            Quiz <span className="text-[#a855f7]">Tatoeba</span>
          </h2>
        </motion.div>

        {/* Bookmark Star */}
        <motion.div
          className="absolute -top-[5vh] right-[2vw] z-20 text-[#fb923c]"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -180 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <svg width="6vw" height="6vw" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 20px rgba(251,146,60,0.8))' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </motion.div>

        <motion.div
          className="bg-[#1e293b]/90 backdrop-blur-2xl border-[0.2vw] border-white/10 rounded-[3vw] p-[4vw] shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
          initial={{ opacity: 0, y: '10vh' }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: '10vh' }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <p className="text-[3vw] font-bold text-white mb-[6vh] text-center">
            "La gare est près d'ici."
          </p>

          <div className="grid grid-cols-1 gap-[2vh]">
            <motion.div
              className="bg-white/5 border-[0.15vw] border-white/20 rounded-[1.5vw] p-[2vw] text-[2vw] font-bold text-white/70"
              initial={{ opacity: 0, x: '-5vw' }}
              animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: '-5vw' }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              La stazione è lontana da qui.
            </motion.div>

            <motion.div
              className="bg-white/5 border-[0.15vw] border-white/20 rounded-[1.5vw] p-[2vw] text-[2vw] font-bold text-white/70"
              initial={{ opacity: 0, x: '-5vw' }}
              animate={{
                opacity: phase >= 2 ? 1 : 0,
                x: phase >= 2 ? 0 : '-5vw',
                backgroundColor: phase >= 3 ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
                borderColor: phase >= 3 ? "rgba(16, 185, 129, 1)" : "rgba(255, 255, 255, 0.2)",
                color: phase >= 3 ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.7)",
                boxShadow: phase >= 3 ? "0 0 30px rgba(16,185,129,0.4)" : "none",
                scale: phase >= 3 ? 1.05 : 1
              }}
              transition={{ duration: 0.5, delay: phase >= 3 ? 0 : 0.2 }}
            >
              <div className="flex justify-between items-center">
                La stazione è vicino a qui.
                {phase >= 3 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <svg width="3vw" height="3vw" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="bg-white/5 border-[0.15vw] border-white/20 rounded-[1.5vw] p-[2vw] text-[2vw] font-bold text-white/70"
              initial={{ opacity: 0, x: '-5vw' }}
              animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: '-5vw' }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              L'aeroporto è vicino a qui.
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-[8vh] bg-[#fb923c] text-[#0f172a] px-[3vw] py-[2vh] rounded-[1vw] rotate-2 shadow-[0_0_40px_rgba(251,146,60,0.5)]"
        initial={{ opacity: 0, y: '5vh' }}
        animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: '5vh' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="text-[3vw] font-black uppercase">Frasi reali — Vocabolario personale</span>
      </motion.div>
    </motion.div>
  );
}
