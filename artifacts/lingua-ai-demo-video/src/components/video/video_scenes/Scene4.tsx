import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),   // Title
      setTimeout(() => setPhase(2), 800),   // Shadowing card
      setTimeout(() => setPhase(3), 1600),  // Mic pulse
      setTimeout(() => setPhase(4), 2200),  // Score pops up
      setTimeout(() => setPhase(5), 3000),  // Quiz card slides in
      setTimeout(() => setPhase(6), 4000),  // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10 px-12"
      initial={{ opacity: 0, y: '20vh' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full flex justify-between items-center max-w-6xl">
        
        {/* Left text */}
        <motion.div
          className="w-1/3"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[4vw] font-black leading-tight text-white mb-4">
            Allenamento <span className="text-[#10b981]">Attivo</span>
          </h2>
          <p className="text-[1.5vw] text-white/70 mb-8">
            Ascolta, ripeti e mettiti alla prova con quiz generati all'istante.
          </p>
          
          <div className="flex gap-4">
            <span className="px-4 py-2 rounded-full bg-white/10 text-white font-medium border border-white/20">Shadowing</span>
            <span className="px-4 py-2 rounded-full bg-[#10b981]/20 text-[#10b981] font-medium border border-[#10b981]/40">Quiz Veloce</span>
          </div>
        </motion.div>

        {/* Right UI Elements stacked */}
        <div className="w-1/2 relative h-[60vh]">
          
          {/* Shadowing UI */}
          <motion.div
            className="absolute top-0 right-0 w-[90%] bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
            initial={{ opacity: 0, x: 100, rotateZ: 5 }}
            animate={phase >= 2 ? { opacity: 1, x: 0, rotateZ: -2 } : { opacity: 0, x: 100, rotateZ: 5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ zIndex: 10 }}
          >
            <div className="text-[#a855f7] font-bold mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
              Shadowing
            </div>
            <p className="text-2xl font-medium text-white mb-6">"Can we meet later?"</p>
            
            <div className="flex items-center justify-between">
              <motion.div 
                className="w-12 h-12 rounded-full bg-[#fb923c] flex items-center justify-center relative"
                animate={phase >= 3 ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <motion.div className="absolute inset-0 bg-[#fb923c] rounded-full opacity-50"
                  animate={phase >= 3 ? { scale: [1, 2], opacity: [0.5, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path></svg>
              </motion.div>

              <motion.div
                className="text-[#10b981] font-black text-3xl"
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={phase >= 4 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                98% Eccellente
              </motion.div>
            </div>
          </motion.div>

          {/* Quiz UI */}
          <motion.div
            className="absolute bottom-0 left-0 w-[85%] bg-[#1e293b]/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 100, rotateZ: -5 }}
            animate={phase >= 5 ? { opacity: 1, y: 0, rotateZ: 3 } : { opacity: 0, y: 100, rotateZ: -5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ zIndex: 20 }}
          >
            <div className="text-[#3b82f6] font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>
              Quiz Veloce
            </div>
            <p className="text-xl text-white mb-4">Come si dice "Ho perso" (il treno)?</p>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-white/50">I lost</div>
              <motion.div 
                className="p-3 rounded-lg border border-[#10b981] bg-[#10b981]/20 text-white font-medium flex justify-between items-center"
                initial={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                animate={phase >= 5 ? { backgroundColor: "rgba(16, 185, 129, 0.2)", borderColor: "rgba(16, 185, 129, 1)" } : {}}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                I missed
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
