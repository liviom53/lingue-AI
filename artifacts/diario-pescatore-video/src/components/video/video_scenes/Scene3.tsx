import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const chips = [
  { icon: '🎣', label: 'Tecnica', value: 'Surf casting' },
  { icon: '🐛', label: 'Esca', value: 'Seppie vive' },
  { icon: '📍', label: 'Spot', value: 'Scogli a N-O' },
];

export function Scene3() {
  const [phase, setPhase] = useState(0);
  const [activeChip, setActiveChip] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 9000),
      setTimeout(() => setPhase(5), 12000),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase < 4) return;
    const iv = setInterval(() => setActiveChip(p => (p+1) % chips.length), 1400);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity:0, x:'-5vw' }}
      animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, x:'5vw' }}
      transition={{ duration:0.9 }}
    >
      {/* Titolo */}
      <motion.div className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity:0, x:-50 }}
        animate={phase>=1 ? { opacity:1, x:0 } : { opacity:0, x:-50 }}
        transition={{ duration:0.8 }}
      >
        <h2 className="text-[5.5vw] font-black leading-none text-white uppercase" style={{ fontFamily:'Bebas Neue, sans-serif' }}>
          Guru <span className="text-[#f59e0b]">AI</span>
        </h2>
        <p className="text-[1.8vw] text-white/60 mt-1" style={{ fontFamily:'Inter, sans-serif' }}>Il tuo assistente di pesca personale</p>
      </motion.div>

      {/* Bubble AI */}
      <motion.div
        className="relative max-w-[75vw] rounded-[2vw] border border-[#0ea5e9]/30 bg-gradient-to-br from-[#0ea5e9]/15 to-[#051525]/90 backdrop-blur-xl p-[3vw] shadow-[0_0_50px_rgba(14,165,233,0.2)]"
        initial={{ opacity:0, y:50, scale:0.92 }}
        animate={phase>=2 ? { opacity:1, y:0, scale:1 } : { opacity:0, y:50, scale:0.92 }}
        transition={{ type:'spring', stiffness:180, damping:22 }}
      >
        {/* Avatar AI */}
        <div className="flex items-center gap-[1.5vw] mb-[2vh]">
          <div className="w-[5vw] h-[5vw] rounded-full bg-[#0ea5e9] flex items-center justify-center text-[2.5vw] shadow-[0_0_20px_rgba(14,165,233,0.5)]">
            🎣
          </div>
          <div>
            <p className="text-[1.8vw] font-bold text-[#0ea5e9]" style={{ fontFamily:'Inter, sans-serif' }}>Guru AI</p>
            <p className="text-[1.3vw] text-white/50" style={{ fontFamily:'Inter, sans-serif' }}>Analisi meteo · Porto Badino</p>
          </div>
        </div>

        <motion.p
          className="text-[2.5vw] text-white leading-relaxed font-medium"
          style={{ fontFamily:'Inter, sans-serif' }}
          initial={{ opacity:0 }}
          animate={phase>=2 ? { opacity:1 } : { opacity:0 }}
          transition={{ delay:0.4, duration:0.8 }}
        >
          Esci dalle <span className="text-[#f59e0b] font-bold">06:30 alle 09:00</span>.
          Vento N favorevole, usa <span className="text-[#0ea5e9] font-bold">seppie</span> vicino agli scogli.
          Alta probabilità di <span className="text-[#34d399] font-bold">orata e branzino</span>.
        </motion.p>
      </motion.div>

      {/* Chips ciclanti */}
      <div className="flex gap-[2vw] mt-[4vh]">
        <AnimatePresence mode="wait">
          {phase >= 3 && chips.map((c, i) => (
            <motion.div key={i}
              className="flex items-center gap-[1vw] px-[2.5vw] py-[1.5vh] rounded-[1.5vw] border backdrop-blur"
              style={{
                borderColor: i === activeChip ? 'rgba(14,165,233,0.6)' : 'rgba(255,255,255,0.12)',
                background: i === activeChip ? 'rgba(14,165,233,0.18)' : 'rgba(255,255,255,0.05)',
                boxShadow: i === activeChip ? '0 0 20px rgba(14,165,233,0.3)' : 'none',
                transition: 'all 0.4s ease',
              }}
              initial={{ opacity:0, scale:0.8 }}
              animate={{ opacity:1, scale: i === activeChip ? 1.07 : 1 }}
              transition={{ delay:i*0.1, type:'spring' }}
            >
              <span className="text-[2.5vw]">{c.icon}</span>
              <div>
                <p className="text-[1.2vw] text-white/50 uppercase tracking-widest" style={{ fontFamily:'Inter, sans-serif' }}>{c.label}</p>
                <p className="text-[1.8vw] font-bold text-white" style={{ fontFamily:'Inter, sans-serif' }}>{c.value}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
