import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const specie = [
  { emoji:'🐟', nome:'Spigola', color:'#0ea5e9' },
  { emoji:'🐠', nome:'Orata',   color:'#f59e0b' },
  { emoji:'🎣', nome:'Ombrina', color:'#a78bfa' },
  { emoji:'🐡', nome:'Dentice', color:'#f87171' },
  { emoji:'🐟', nome:'Cernia',  color:'#34d399' },
  { emoji:'🐚', nome:'Seppie',  color:'#fb923c' },
  { emoji:'🐠', nome:'Sarago',  color:'#38bdf8' },
  { emoji:'🎣', nome:'Cefalo',  color:'#fbbf24' },
  { emoji:'🐡', nome:'Scorfano',color:'#f472b6' },
];

export function Scene7() {
  const [phase, setPhase] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 10000),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase < 2) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= specie.length) clearInterval(iv);
    }, 500);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity:0, scale:1.06 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.95, filter:'blur(10px)' }}
      transition={{ duration:0.9 }}
    >
      {/* Titolo */}
      <motion.div className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity:0, x:-50 }}
        animate={phase>=1 ? { opacity:1, x:0 } : { opacity:0, x:-50 }}
        transition={{ duration:0.8 }}
      >
        <h2 className="text-[5.5vw] font-black leading-none text-white uppercase" style={{ fontFamily:'Bebas Neue, sans-serif' }}>
          Enciclopedia <span className="text-[#f59e0b]">Specie</span>
        </h2>
        <p className="text-[1.8vw] text-white/60 mt-1" style={{ fontFamily:'Inter, sans-serif' }}>50 specie del Mediterraneo con foto reali</p>
      </motion.div>

      {/* Griglia specie */}
      <div className="grid grid-cols-3 gap-[2vw] mt-[10vh]" style={{ width:'75vw' }}>
        {specie.map((s, i) => (
          <motion.div key={i}
            className="flex items-center gap-[1.5vw] px-[2vw] py-[1.5vh] rounded-[1.5vw] border border-white/10 bg-white/5 backdrop-blur"
            style={{ borderLeftWidth:3, borderLeftColor: i < visibleCount ? s.color : 'transparent',
              boxShadow: i < visibleCount ? `0 0 15px ${s.color}30` : 'none',
              transition:'border-color 0.3s, box-shadow 0.3s' }}
            initial={{ opacity:0, scale:0.8 }}
            animate={i < visibleCount ? { opacity:1, scale:1 } : { opacity:0.2, scale:0.9 }}
            transition={{ type:'spring', stiffness:280, damping:22 }}
          >
            <span className="text-[3vw] select-none">{s.emoji}</span>
            <span className="text-[2vw] font-bold text-white" style={{ fontFamily:'Inter, sans-serif' }}>{s.nome}</span>
          </motion.div>
        ))}
      </div>

      {/* Contatore */}
      <motion.div className="absolute bottom-[10vh] right-[5vw]"
        initial={{ opacity:0 }} animate={phase>=2 ? { opacity:1 } : { opacity:0 }}
        transition={{ delay:1 }}
      >
        <div className="text-center">
          <span className="text-[8vw] font-black text-[#f59e0b]" style={{ fontFamily:'Bebas Neue, sans-serif',
            textShadow:'0 0 30px rgba(245,158,11,0.6)' }}>50</span>
          <p className="text-[2vw] text-white/60 -mt-2" style={{ fontFamily:'Inter, sans-serif' }}>specie</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
