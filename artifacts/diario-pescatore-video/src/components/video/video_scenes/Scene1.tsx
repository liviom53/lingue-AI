import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FISH = ['🐟','🐠','🎣','🐡','🐚','🌊','⚓'];

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setPhase(4), 6000),
      setTimeout(() => setPhase(5), 11500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity:0, scale:1.15 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:1.8, filter:'blur(24px)' }}
      transition={{ duration:1.1, ease:[0.16,1,0.3,1] }}
    >
      {/* Badge */}
      <motion.div
        className="flex items-center gap-[1.5vw] rounded-full border-2 border-[#0ea5e9]/50 bg-[#0ea5e9]/10 backdrop-blur"
        style={{ padding:'1vh 2.5vw', marginBottom:'4vh', boxShadow:'0 0 30px rgba(14,165,233,0.35)' }}
        initial={{ opacity:0, y:-40, scale:0.5 }}
        animate={phase>=1 ? { opacity:1, y:0, scale:1 } : { opacity:0, y:-40, scale:0.5 }}
        transition={{ type:'spring', stiffness:350, damping:22 }}
      >
        <div className="w-[1vw] h-[1vw] rounded-full bg-[#0ea5e9] animate-pulse" />
        <span className="text-[1.5vw] font-bold tracking-widest uppercase text-white" style={{ fontFamily:'Inter, sans-serif' }}>Il diario del pescatore</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-[10vw] font-black tracking-tight leading-none text-white text-center"
        style={{ fontFamily:'Bebas Neue, sans-serif', textShadow: phase>=2 ? '0 0 60px rgba(14,165,233,0.7), 0 0 120px rgba(14,165,233,0.3)' : 'none' }}
        initial={{ opacity:0, scale:0.2, filter:'blur(20px)' }}
        animate={phase>=2 ? { opacity:1, scale:1, filter:'blur(0px)', rotate:[-3,3,-1,1,0] } : { opacity:0, scale:0.2, filter:'blur(20px)' }}
        transition={{ duration:0.9, ease:'easeOut' }}
      >
        DIARIO<br/>
        <span className="text-[#0ea5e9]">DEL PESCATORE</span>
      </motion.h1>

      {/* Tagline */}
      <motion.div
        className="flex flex-col items-center"
        style={{ gap:'1.5vh', marginTop:'3vh' }}
        initial={{ opacity:0, y:40 }}
        animate={phase>=3 ? { opacity:1, y:0 } : { opacity:0, y:40 }}
        transition={{ duration:1, type:'spring' }}
      >
        <p className="text-[2.6vw] font-bold text-white/85 text-center" style={{ fontFamily:'Inter, sans-serif' }}>
          Ogni uscita. Ogni cattura. Ogni previsione.
        </p>
        <div className="bg-[#f59e0b] text-[#051525] rounded-xl shadow-xl"
          style={{ padding:'1.2vh 3vw', transform:'rotate(-2deg)', marginTop:'1vh' }}>
          <span className="text-[2vw] font-black uppercase whitespace-nowrap" style={{ fontFamily:'Inter, sans-serif' }}>
            Gratis · Offline · Installabile
          </span>
        </div>
      </motion.div>

      {/* Pesci fluttuanti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FISH.map((f, i) => (
          <motion.div key={i}
            className="absolute text-[5vw] select-none"
            initial={{ opacity:0, scale:0 }}
            animate={phase>=2 ? {
              opacity:[0,0.35,0],
              scale: phase>=4 ? [1,2.2] : [0.6,1.2],
              x: (i % 2 === 0 ? 1 : -1) * (60 + i * 40),
              y: (i % 3 === 0 ? -1 : 1) * (40 + i * 30),
              rotate: (i % 2 === 0 ? 1 : -1) * 30,
            } : { opacity:0, scale:0 }}
            transition={{ duration:3+i*0.5, repeat:Infinity, delay:i*0.35 }}
            style={{ left:`${8+i*12}%`, top:`${15+i*10}%` }}
          >
            {f}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
