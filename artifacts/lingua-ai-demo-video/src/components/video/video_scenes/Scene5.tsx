import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Shadowing Card
      setTimeout(() => setPhase(2), 2500),  // Shadowing Waveform
      setTimeout(() => setPhase(3), 5000),  // Chat Card
      setTimeout(() => setPhase(4), 6500),  // Chat Messages
      setTimeout(() => setPhase(5), 9000),  // Subtitle
      setTimeout(() => setPhase(6), 12000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10 px-[4vw]"
      initial={{ opacity: 0, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: '-100vh', filter: 'blur(20px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full flex justify-between items-center gap-[3vw] max-w-[90vw]">
        
        {/* Left: Shadowing */}
        <motion.div
          className="flex-1 bg-[#1e293b]/80 backdrop-blur-xl rounded-[2vw] p-[3vw] border-[0.2vw] border-[#10b981]/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
          initial={{ opacity: 0, x: '-10vw', rotateY: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: '-10vw', rotateY: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ perspective: 1000 }}
        >
          <div className="text-[#10b981] font-black text-[2vw] mb-[3vh] uppercase tracking-wider">
            Shadowing
          </div>
          <p className="text-[3.5vw] font-black text-white leading-tight mb-[6vh] drop-shadow-lg">
            "La cuenta, por favor."
          </p>

          {/* Waveform */}
          <div className="flex items-center gap-[1vw] h-[12vh] bg-[#0f172a]/50 rounded-[1.5vw] p-[1.5vw]">
            <div className="w-[8vh] h-[8vh] rounded-full bg-[#10b981] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.6)] shrink-0">
              <svg width="4vh" height="4vh" viewBox="0 0 24 24" fill="white"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
            </div>
            <div className="flex-1 flex gap-[0.3vw] items-center justify-center h-full px-[1vw] overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[0.5vw] bg-[#10b981] rounded-full"
                  animate={phase >= 2 ? {
                    height: ['20%', '90%', '40%', '100%', '30%'][i % 5]
                  } : { height: '10%' }}
                  transition={{ 
                    duration: 0.3 + (Math.random() * 0.4), 
                    repeat: Infinity, 
                    repeatType: "mirror",
                    delay: phase >= 2 ? i * 0.05 : 0
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-[4vh] text-center text-[#10b981] font-black text-[2vw] uppercase">
            Ripeti e impara
          </div>
        </motion.div>

        {/* Right: Chat AI */}
        <motion.div
          className="flex-1 bg-[#1e293b]/80 backdrop-blur-xl rounded-[2vw] p-[3vw] border-[0.2vw] border-[#3b82f6]/50 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
          initial={{ opacity: 0, x: '10vw', rotateY: 20 }}
          animate={phase >= 3 ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: '10vw', rotateY: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ perspective: 1000 }}
        >
          <div className="text-[#3b82f6] font-black text-[2vw] mb-[4vh] uppercase tracking-wider flex items-center justify-between">
            <span>Chat AI</span>
            <span className="bg-[#fb923c] text-white text-[1.2vw] px-[1vw] py-[0.5vh] rounded-full font-bold">DeepSeek</span>
          </div>

          <div className="space-y-[3vh]">
            <motion.div 
              className="bg-[#3b82f6] text-white rounded-[1.5vw] rounded-tr-none p-[2vw] text-[2vw] font-bold self-end ml-[3vw] shadow-lg"
              initial={{ opacity: 0, scale: 0.8, x: '5vw' }}
              animate={phase >= 4 ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: '5vw' }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              Ciao! Parliamo in spagnolo?
            </motion.div>
            
            <motion.div 
              className="bg-[#0f172a] border border-[#a855f7]/50 rounded-[1.5vw] rounded-tl-none p-[2vw] text-white text-[2vw] font-bold self-start mr-[3vw] shadow-lg"
              initial={{ opacity: 0, scale: 0.8, x: '-5vw' }}
              animate={phase >= 4 ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: '-5vw' }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.5 }}
            >
              ¡Claro que sí! ¿De qué quieres hablar?
            </motion.div>
          </div>

          <div className="mt-[4vh] text-center text-[#3b82f6] font-black text-[2vw] uppercase">
            DeepSeek AI sempre con te
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
