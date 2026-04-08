import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Scene8() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Titolo
      setTimeout(() => setPhase(2), 2000),  // Card toggle appare
      setTimeout(() => setPhase(3), 4000),  // Toggle si attiva (verde)
      setTimeout(() => setPhase(4), 6000),  // Frecce flusso DETTA→TRADUCE→LEGGE
      setTimeout(() => setPhase(5), 9500),  // Badge finale
      setTimeout(() => setPhase(6), 12000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const steps = [
    { icon: '🎙️', label: 'DETTA', color: '#10b981' },
    { icon: '🌍', label: 'TRADUCE', color: '#3b82f6' },
    { icon: '🔊', label: 'LEGGE', color: '#a855f7' },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: '8vh', filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Sfondo verde pulsante */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={phase >= 3 ? {
          background: [
            'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 60%)',
            'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.18) 0%, transparent 60%)',
            'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 60%)',
          ]
        } : { background: 'transparent' }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Titolo */}
      <motion.div
        className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity: 0, x: -40 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <h2 className="text-[4.5vw] font-black leading-none text-white uppercase">
          ♿ <span className="text-[#10b981]">Accessibilità</span>
        </h2>
        <p className="text-[2vw] text-white/60 font-bold mt-[1vh]">
          Per ipovedenti con TalkBack
        </p>
      </motion.div>

      {/* Card toggle Modalità Ipovedenti */}
      <motion.div
        className="w-[70vw] bg-[#1e293b]/90 backdrop-blur-xl rounded-[2.5vw] p-[3.5vw] border-[0.2vw] mb-[5vh]"
        style={{ borderColor: phase >= 3 ? '#10b981' : 'rgba(255,255,255,0.1)' }}
        initial={{ opacity: 0, y: '5vh', rotateX: 15 }}
        animate={phase >= 2 ? {
          opacity: 1, y: 0, rotateX: 0,
          boxShadow: phase >= 3
            ? '0 0 60px rgba(16,185,129,0.35)'
            : '0 20px 40px rgba(0,0,0,0.4)'
        } : { opacity: 0, y: '5vh', rotateX: 15 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <div className="flex items-center justify-between mb-[3vh]">
          <div>
            <p className="text-[2.2vw] font-black text-white">👁️ Modalità Ipovedenti</p>
            <p className="text-[1.4vw] text-white/50 mt-[0.5vh]">
              Detta → traduce → legge in automatico
            </p>
          </div>
          {/* Toggle animato */}
          <motion.div
            className="relative rounded-full flex-shrink-0"
            style={{ width: '7vw', height: '3.8vw' }}
            animate={{ background: phase >= 3 ? '#10b981' : '#334155' }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="absolute top-[0.4vw] rounded-full bg-white"
              style={{ width: '3vw', height: '3vw' }}
              animate={{ left: phase >= 3 ? '3.6vw' : '0.4vw' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          </motion.div>
        </div>

        <AnimatePresence>
          {phase >= 3 && (
            <motion.p
              className="text-[1.5vw] font-bold text-[#10b981]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4 }}
            >
              ✅ Attivo — detta e ascolta, senza toccare nient'altro
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Flusso: DETTA → TRADUCE → LEGGE */}
      <div className="flex items-center gap-[2vw]">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-[2vw]">
            <motion.div
              className="flex flex-col items-center gap-[1.5vh]"
              initial={{ opacity: 0, scale: 0, y: '3vh' }}
              animate={phase >= 4 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0, y: '3vh' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.25 }}
            >
              <motion.div
                className="rounded-[1.5vw] flex items-center justify-center text-[4vw]"
                style={{
                  width: '9vw', height: '9vw',
                  background: `${step.color}22`,
                  border: `0.2vw solid ${step.color}`,
                  boxShadow: `0 0 30px ${step.color}44`,
                }}
                animate={phase >= 4 ? {
                  scale: [1, 1.08, 1],
                  boxShadow: [`0 0 30px ${step.color}44`, `0 0 60px ${step.color}88`, `0 0 30px ${step.color}44`],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
              >
                {step.icon}
              </motion.div>
              <span className="text-[1.8vw] font-black uppercase" style={{ color: step.color }}>
                {step.label}
              </span>
            </motion.div>

            {/* Freccia tra i passi */}
            {i < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={phase >= 4 ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.5, delay: i * 0.25 + 0.3 }}
                style={{ originX: 0 }}
              >
                <svg width="4vw" height="2vw" viewBox="0 0 60 20" fill="none">
                  <motion.path
                    d="M0 10 L50 10 M40 2 L50 10 L40 18"
                    stroke="#64748b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Badge finale */}
      <motion.div
        className="absolute bottom-[8vh] bg-[#10b981] text-[#0f172a] px-[3vw] py-[2vh] rounded-[1vw] shadow-[0_0_50px_rgba(16,185,129,0.6)]"
        style={{ rotate: -2 }}
        initial={{ opacity: 0, y: '5vh', scale: 0.8 }}
        animate={phase >= 5 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: '5vh', scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <span className="text-[2.8vw] font-black uppercase">
          Parla — ascolta — impara. Senza toccare nulla.
        </span>
      </motion.div>
    </motion.div>
  );
}
