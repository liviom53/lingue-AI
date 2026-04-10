import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const badges = [
  { icon:'📱', label:'PWA', sub:'Installabile sul telefono', color:'#0ea5e9' },
  { icon:'🔒', label:'Privato', sub:'I tuoi dati restano sul tuo device', color:'#34d399' },
  { icon:'🌐', label:'Offline', sub:'Funziona senza internet', color:'#f59e0b' },
];

const fish = ['🐟','🐠','🐡','🎣','🐟','🐠'];

export function Scene9() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 6500),
      setTimeout(() => setPhase(5), 11500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity:0, scale:0.92 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:1.08, filter:'blur(20px)' }}
      transition={{ duration:1.1 }}
    >
      {/* Title */}
      <motion.h1
        className="text-[10vw] font-black text-white text-center leading-none mb-[2vh]"
        style={{ fontFamily:'Bebas Neue, sans-serif',
          textShadow: phase>=2 ? '0 0 60px rgba(14,165,233,0.7)' : 'none' }}
        initial={{ opacity:0, scale:0.3, filter:'blur(20px)' }}
        animate={phase>=1 ? { opacity:1, scale:1, filter:'blur(0px)' } : { opacity:0, scale:0.3, filter:'blur(20px)' }}
        transition={{ duration:0.9, ease:'easeOut' }}
      >
        DIARIO<br/>
        <span className="text-[#0ea5e9]">DEL PESCATORE</span>
      </motion.h1>

      <motion.p
        className="text-[2.5vw] text-white/70 mb-[5vh]"
        style={{ fontFamily:'Inter, sans-serif' }}
        initial={{ opacity:0 }}
        animate={phase>=2 ? { opacity:1 } : { opacity:0 }}
        transition={{ duration:0.8 }}
      >
        Gratis. Per sempre.
      </motion.p>

      {/* Badges */}
      <div className="flex gap-[3vw]">
        {badges.map((b, i) => (
          <motion.div key={i}
            className="flex flex-col items-center gap-[1vh] px-[3vw] py-[2.5vh] rounded-[2vw] border border-white/15 bg-white/5 backdrop-blur-xl"
            style={{ boxShadow: `0 0 25px ${b.color}25` }}
            initial={{ opacity:0, y:40, scale:0.8 }}
            animate={phase>=3 ? { opacity:1, y:0, scale:1 } : { opacity:0, y:40, scale:0.8 }}
            transition={{ delay:i*0.2, type:'spring', stiffness:240, damping:20 }}
          >
            <span className="text-[5vw] select-none">{b.icon}</span>
            <span className="text-[2.8vw] font-black" style={{ color:b.color, fontFamily:'Bebas Neue, sans-serif' }}>{b.label}</span>
            <span className="text-[1.4vw] text-white/50 text-center max-w-[18vw]" style={{ fontFamily:'Inter, sans-serif' }}>{b.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Footer by Livio */}
      <motion.div
        className="absolute bottom-[14vh] flex items-center gap-[1.5vw]"
        initial={{ opacity:0 }}
        animate={phase>=4 ? { opacity:1 } : { opacity:0 }}
        transition={{ duration:1 }}
      >
        <div className="h-px w-[10vw] bg-white/20" />
        <span className="text-[2vw] text-white/50" style={{ fontFamily:'Inter, sans-serif' }}>by Livio · v3.5</span>
        <div className="h-px w-[10vw] bg-white/20" />
      </motion.div>

      {/* Pesci animati in basso */}
      <div className="absolute bottom-[6vh] left-0 w-full overflow-hidden pointer-events-none" style={{ height:'4vh' }}>
        {fish.map((f, i) => (
          <motion.span
            key={i}
            className="absolute text-[3.5vw] select-none"
            style={{ bottom:0 }}
            initial={{ x: '-10vw' }}
            animate={phase>=4 ? { x: '110vw' } : { x: '-10vw' }}
            transition={{
              duration: 6 + i * 1.5,
              delay: i * 1.2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {f}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
