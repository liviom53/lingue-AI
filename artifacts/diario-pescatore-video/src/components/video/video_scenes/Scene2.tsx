import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const metrics = [
  { icon: '🌬️', label: 'Vento', value: '12 km/h', color: '#38bdf8' },
  { icon: '🌊', label: 'Marea', value: 'Calante', color: '#0ea5e9' },
  { icon: '🌕', label: 'Luna', value: 'Piena', color: '#fbbf24' },
  { icon: '🌡️', label: 'Temp', value: '19 °C', color: '#34d399' },
];

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 7000),
      setTimeout(() => setPhase(5), 11000),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity:0, filter:'blur(20px)' }}
      animate={{ opacity:1, filter:'blur(0px)' }}
      exit={{ opacity:0, y:'10vh', filter:'blur(10px)' }}
      transition={{ duration:1 }}
    >
      {/* Titolo */}
      <motion.div className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity:0, x:-60 }}
        animate={phase>=1 ? { opacity:1, x:0 } : { opacity:0, x:-60 }}
        transition={{ duration:0.8 }}
      >
        <h2 className="text-[5.5vw] font-black leading-none text-white uppercase" style={{ fontFamily:'Bebas Neue, sans-serif' }}>
          Previsioni <span className="text-[#0ea5e9]">Pesca</span>
        </h2>
        <p className="text-[1.8vw] text-white/60 mt-1" style={{ fontFamily:'Inter, sans-serif' }}>Quando uscire e dove andare</p>
      </motion.div>

      {/* Score card */}
      <motion.div
        className="relative flex flex-col items-center justify-center rounded-[3vw] border-2 border-[#0ea5e9]/40 bg-[#051525]/80 backdrop-blur-xl shadow-[0_0_60px_rgba(14,165,233,0.25)]"
        style={{ width:'40vw', height:'28vh', marginTop:'4vh' }}
        initial={{ opacity:0, scale:0.7, rotateY:30 }}
        animate={phase>=2 ? { opacity:1, scale:1, rotateY:0 } : { opacity:0, scale:0.7, rotateY:30 }}
        transition={{ type:'spring', stiffness:200, damping:20 }}
      >
        <motion.span
          className="font-black text-white leading-none"
          style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:'14vw', lineHeight:1,
            textShadow:'0 0 40px rgba(14,165,233,0.8)' }}
          animate={phase>=2 ? { scale:[1,1.06,1] } : {}}
          transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}
        >
          78
        </motion.span>
        <span className="text-[2.5vw] text-[#0ea5e9] font-bold -mt-2" style={{ fontFamily:'Inter, sans-serif' }}>/100</span>
        <span className="text-[2vw] text-white/70 mt-1" style={{ fontFamily:'Inter, sans-serif' }}>Ottima giornata!</span>

        {/* Anello glowing */}
        <div className="absolute inset-0 rounded-[3vw] pointer-events-none"
          style={{ boxShadow:'inset 0 0 30px rgba(14,165,233,0.15)' }} />
      </motion.div>

      {/* Metriche */}
      <div className="flex gap-[3vw] mt-[4vh]">
        {metrics.map((m, i) => (
          <motion.div key={i}
            className="flex flex-col items-center gap-1 px-[2.5vw] py-[1.5vh] rounded-[1.5vw] border border-white/15 bg-white/5 backdrop-blur"
            initial={{ opacity:0, y:30 }}
            animate={phase>=3 ? { opacity:1, y:0 } : { opacity:0, y:30 }}
            transition={{ delay:i*0.15, type:'spring', stiffness:250, damping:20 }}
          >
            <span className="text-[3vw]">{m.icon}</span>
            <span className="text-[1.4vw] text-white/50 uppercase tracking-widest" style={{ fontFamily:'Inter, sans-serif' }}>{m.label}</span>
            <span className="text-[2vw] font-bold" style={{ color:m.color, fontFamily:'Inter, sans-serif' }}>{m.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Badge AI */}
      <motion.div
        className="absolute bottom-[10vh] right-[5vw] bg-[#f59e0b] text-[#051525] px-[3vw] py-[1.5vh] rounded-[1vw] rotate-3 shadow-2xl"
        initial={{ opacity:0, scale:0, rotate:-20 }}
        animate={phase>=4 ? { opacity:1, scale:1, rotate:3 } : { opacity:0, scale:0, rotate:-20 }}
        transition={{ type:'spring', stiffness:300, damping:15 }}
      >
        <span className="text-[2.2vw] font-black uppercase" style={{ fontFamily:'Inter, sans-serif' }}>Guru AI incluso</span>
      </motion.div>
    </motion.div>
  );
}
