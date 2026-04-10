import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const catches = [
  { emoji:'🐟', specie:'Spigola', peso:'1.4 kg', data:'8 Apr', color:'#0ea5e9' },
  { emoji:'🐠', specie:'Orata',   peso:'0.8 kg', data:'5 Apr', color:'#f59e0b' },
  { emoji:'🎣', specie:'Ombrina', peso:'2.1 kg', data:'1 Apr', color:'#a78bfa' },
];

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4500),
      setTimeout(() => setPhase(5), 10000),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity:0, x:'8vw' }}
      animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, x:'-8vw' }}
      transition={{ duration:0.9 }}
    >
      {/* Titolo */}
      <motion.div className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity:0, x:-50 }}
        animate={phase>=1 ? { opacity:1, x:0 } : { opacity:0, x:-50 }}
        transition={{ duration:0.8 }}
      >
        <h2 className="text-[5.5vw] font-black leading-none text-white uppercase" style={{ fontFamily:'Bebas Neue, sans-serif' }}>
          Diario <span className="text-[#0ea5e9]">Catture</span>
        </h2>
        <p className="text-[1.8vw] text-white/60 mt-1" style={{ fontFamily:'Inter, sans-serif' }}>Tutte le uscite e il pescato in un posto solo</p>
      </motion.div>

      {/* Cards catture */}
      <div className="flex flex-col gap-[2.5vh] w-[75vw] mt-[6vh]">
        {catches.map((c, i) => (
          <motion.div key={i}
            className="flex items-center gap-[3vw] px-[3vw] py-[2.5vh] rounded-[2vw] border border-white/15 bg-white/5 backdrop-blur-xl shadow-lg"
            initial={{ opacity:0, x:80, scale:0.9 }}
            animate={phase >= i+2 ? { opacity:1, x:0, scale:1 } : { opacity:0, x:80, scale:0.9 }}
            transition={{ type:'spring', stiffness:220, damping:22 }}
            style={{ borderLeftWidth:4, borderLeftColor:c.color }}
          >
            <span className="text-[5vw] select-none">{c.emoji}</span>
            <div className="flex-1">
              <p className="text-[2.8vw] font-black text-white" style={{ fontFamily:'Bebas Neue, sans-serif' }}>{c.specie}</p>
              <p className="text-[1.5vw] text-white/50" style={{ fontFamily:'Inter, sans-serif' }}>Registrata il {c.data}</p>
            </div>
            <div className="text-right">
              <p className="text-[2.8vw] font-bold" style={{ color:c.color, fontFamily:'Bebas Neue, sans-serif' }}>{c.peso}</p>
              <p className="text-[1.3vw] text-white/40" style={{ fontFamily:'Inter, sans-serif' }}>peso</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Badge */}
      <motion.div className="absolute bottom-[10vh] right-[5vw] bg-[#f59e0b] text-[#051525] px-[3vw] py-[1.5vh] rounded-[1vw] rotate-2 shadow-2xl"
        initial={{ opacity:0, scale:0, rotate:-20 }}
        animate={phase>=5 ? { opacity:1, scale:1, rotate:2 } : { opacity:0, scale:0, rotate:-20 }}
        transition={{ type:'spring', stiffness:300, damping:15 }}
      >
        <span className="text-[2.2vw] font-black uppercase" style={{ fontFamily:'Inter, sans-serif' }}>Ogni cattura salvata</span>
      </motion.div>
    </motion.div>
  );
}
