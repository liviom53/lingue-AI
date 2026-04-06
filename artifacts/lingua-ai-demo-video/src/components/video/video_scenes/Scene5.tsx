import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),   // App mockups spread
      setTimeout(() => setPhase(2), 1200),  // Logo + Tagline
      setTimeout(() => setPhase(3), 2000),  // Download buttons
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: '20vh' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      
      {/* App Mockups Fan Out */}
      <div className="relative w-full h-[40vh] flex items-center justify-center mb-10 perspective-1000">
        {[
          { color: "bg-[#3b82f6]/20", border: "border-[#3b82f6]/40", rotateY: -30, x: -300, z: -100, delay: 0 },
          { color: "bg-[#1e293b]/80", border: "border-white/20", rotateY: 0, x: 0, z: 0, delay: 0.2 },
          { color: "bg-[#a855f7]/20", border: "border-[#a855f7]/40", rotateY: 30, x: 300, z: -100, delay: 0.1 },
        ].map((mockup, i) => (
          <motion.div
            key={i}
            className={`absolute w-[200px] h-[400px] rounded-3xl ${mockup.color} ${mockup.border} border-2 backdrop-blur-md shadow-2xl flex items-center justify-center overflow-hidden`}
            initial={{ opacity: 0, y: 100, x: 0, rotateY: 0, z: -500 }}
            animate={phase >= 1 ? { 
              opacity: i === 1 ? 1 : 0.6, 
              y: 0, 
              x: mockup.x, 
              rotateY: mockup.rotateY,
              z: mockup.z 
            } : { opacity: 0, y: 100, x: 0, rotateY: 0, z: -500 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: mockup.delay }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Fake UI lines inside mockups */}
            <div className="w-full h-full p-4 flex flex-col gap-4 opacity-50">
              <div className="w-full h-8 bg-white/20 rounded-full" />
              <div className="w-3/4 h-4 bg-white/10 rounded-full" />
              <div className="w-1/2 h-4 bg-white/10 rounded-full" />
              <div className="mt-auto w-full h-32 bg-white/10 rounded-2xl" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Logo & Tagline */}
      <div className="text-center z-20">
        <motion.h1 
          className="text-[6vw] font-black tracking-tighter text-white leading-none mb-2 text-gradient"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          Lingua AI
        </motion.h1>
        
        <motion.p 
          className="text-[2vw] font-medium text-white/70"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Inizia a parlarla male... poi si vedrà.
        </motion.p>
      </div>

      {/* CTA Buttons */}
      <motion.div 
        className="flex gap-6 mt-12 z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="px-8 py-4 bg-white text-[#0f172a] rounded-full font-bold text-xl flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08z"/><path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
          App Store
        </div>
        <div className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-xl flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.52 14.86c-.52 0-1.05-.18-1.46-.53l-3.32-2.85 2.1-2.1 3.25 2.79c1.07.92 1.18 2.54.26 3.61-.22.25-.52.48-.83.65-2.42 1.34-5.32 1.76-8.22 1.19-1.99-.39-3.74-1.38-5.14-2.85C2.46 9.09 2 6.64 2 4.19c0-1.19.96-2.15 2.15-2.15h1.74c1.19 0 2.15.96 2.15 2.15v2.96c0 1.19-.96 2.15-2.15 2.15H4.66c.21 1.65.84 3.22 1.83 4.55 1.05 1.41 2.39 2.55 3.96 3.32 1.56.76 3.29 1.18 5.04 1.25l.02-2.88h.01c.21-1.65.84-3.22 1.83-4.55 1.05-1.41 2.39-2.55 3.96-3.32 1.56-.76 3.29-1.18 5.04-1.25V4.18c0-1.18-.95-2.14-2.14-2.14h-1.74c-1.19 0-2.15.96-2.15 2.15v2.96c0 1.19.96 2.15 2.15 2.15h1.22c-.22 1.65-.85 3.22-1.84 4.55-1.05 1.41-2.39 2.55-3.96 3.32-1.56.76-3.29 1.18-5.04 1.25z"/></svg>
          Google Play
        </div>
      </motion.div>

    </motion.div>
  );
}
