import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 5000),
      setTimeout(() => setPhase(4), 8000),
      setTimeout(() => setPhase(5), 11500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity:0, scale:1.08 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.94, filter:'blur(12px)' }}
      transition={{ duration:1 }}
    >
      {/* Titolo */}
      <motion.div className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity:0, x:-50 }}
        animate={phase>=1 ? { opacity:1, x:0 } : { opacity:0, x:-50 }}
        transition={{ duration:0.8 }}
      >
        <h2 className="text-[5.5vw] font-black leading-none text-white uppercase" style={{ fontFamily:'Bebas Neue, sans-serif' }}>
          Scanner <span className="text-[#34d399]">Pesce AI</span>
        </h2>
        <p className="text-[1.8vw] text-white/60 mt-1" style={{ fontFamily:'Inter, sans-serif' }}>Scatta una foto — l'AI identifica la specie</p>
      </motion.div>

      {/* Viewfinder animato */}
      <AnimatePresence mode="wait">
        {phase >= 2 && phase < 4 && (
          <motion.div key="viewfinder"
            className="relative flex items-center justify-center rounded-[2vw] border-2 border-[#34d399]/70 bg-[#051525]/60 backdrop-blur"
            style={{ width:'40vw', height:'34vh', boxShadow:'0 0 40px rgba(52,211,153,0.3)' }}
            initial={{ opacity:0, scale:0.85 }}
            animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0, scale:1.1 }}
            transition={{ duration:0.5 }}
          >
            {/* Cornette viewfinder */}
            {[['top-0 left-0','border-t-2 border-l-2'],['top-0 right-0','border-t-2 border-r-2'],
              ['bottom-0 left-0','border-b-2 border-l-2'],['bottom-0 right-0','border-b-2 border-r-2']].map(([pos,cls],i)=>(
              <div key={i} className={`absolute w-[4vw] h-[4vw] ${pos} ${cls} border-[#34d399] m-[1vw]`} />
            ))}

            {/* Scan line */}
            <motion.div className="absolute w-full h-[2px] bg-[#34d399]/70 left-0"
              style={{ boxShadow:'0 0 10px rgba(52,211,153,0.8)' }}
              animate={{ top:['5%','95%','5%'] }}
              transition={{ duration:1.8, repeat:Infinity, ease:'linear' }}
            />

            <span className="text-[12vw] select-none z-10">🐟</span>

            {/* Spinner */}
            <motion.div className="absolute bottom-[2vh] right-[2vw] flex items-center gap-[1vw]">
              <motion.div className="w-[1.5vw] h-[1.5vw] rounded-full border-2 border-[#34d399] border-t-transparent"
                animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }} />
              <span className="text-[1.5vw] text-[#34d399]" style={{ fontFamily:'Inter, sans-serif' }}>Analisi in corso...</span>
            </motion.div>
          </motion.div>
        )}

        {/* Risultato */}
        {phase >= 4 && (
          <motion.div key="result"
            className="flex flex-col items-center gap-[2vh]"
            initial={{ opacity:0, y:30 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }}
            transition={{ type:'spring', stiffness:200 }}
          >
            <span className="text-[12vw] select-none">🐟</span>
            <div className="px-[4vw] py-[2vh] rounded-[2vw] border-2 border-[#34d399]/50 bg-[#34d399]/10 backdrop-blur text-center"
              style={{ boxShadow:'0 0 40px rgba(52,211,153,0.25)' }}>
              <p className="text-[4vw] font-black text-white" style={{ fontFamily:'Bebas Neue, sans-serif' }}>Spigola / Branzino</p>
              <div className="flex items-center justify-center gap-[3vw] mt-[1vh]">
                <div>
                  <p className="text-[1.4vw] text-white/50 uppercase" style={{ fontFamily:'Inter, sans-serif' }}>Confidenza</p>
                  <p className="text-[3vw] font-bold text-[#34d399]" style={{ fontFamily:'Bebas Neue, sans-serif' }}>97%</p>
                </div>
                <div className="w-px h-[5vh] bg-white/20" />
                <div>
                  <p className="text-[1.4vw] text-white/50 uppercase" style={{ fontFamily:'Inter, sans-serif' }}>Peso stimato</p>
                  <p className="text-[3vw] font-bold text-[#f59e0b]" style={{ fontFamily:'Bebas Neue, sans-serif' }}>1.2 kg</p>
                </div>
              </div>
            </div>
            <motion.div className="bg-[#34d399] text-[#051525] px-[3vw] py-[1vh] rounded-full font-black text-[1.8vw]"
              style={{ fontFamily:'Inter, sans-serif' }}
              initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', delay:0.3 }}>
              Salvato nel diario ✓
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge */}
      <motion.div className="absolute bottom-[10vh] right-[5vw] bg-[#0ea5e9] text-white px-[2.5vw] py-[1.5vh] rounded-[1vw] -rotate-2 shadow-xl"
        initial={{ opacity:0, scale:0, rotate:20 }}
        animate={phase>=1 ? { opacity:1, scale:1, rotate:-2 } : { opacity:0, scale:0, rotate:20 }}
        transition={{ type:'spring', stiffness:300, damping:15, delay:0.5 }}
      >
        <span className="text-[2vw] font-black uppercase" style={{ fontFamily:'Inter, sans-serif' }}>Riconoscimento automatico</span>
      </motion.div>
    </motion.div>
  );
}
