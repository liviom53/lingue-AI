import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Scene6() {
  const [phase, setPhase] = useState(0);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => { setPhase(4); setShowAI(true); }, 6000),
      setTimeout(() => setPhase(5), 11500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity:0, filter:'blur(16px)' }}
      animate={{ opacity:1, filter:'blur(0px)' }}
      exit={{ opacity:0, y:'-8vh' }}
      transition={{ duration:0.9 }}
    >
      {/* Titolo */}
      <motion.div className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity:0, x:-50 }}
        animate={phase>=1 ? { opacity:1, x:0 } : { opacity:0, x:-50 }}
        transition={{ duration:0.8 }}
      >
        <h2 className="text-[5.5vw] font-black leading-none text-white uppercase" style={{ fontFamily:'Bebas Neue, sans-serif' }}>
          Chat <span className="text-[#a78bfa]">AI</span>
        </h2>
        <p className="text-[1.8vw] text-white/60 mt-1" style={{ fontFamily:'Inter, sans-serif' }}>Chiedi tutto sulla pesca — risponde subito</p>
      </motion.div>

      {/* Chat container */}
      <div className="flex flex-col gap-[2.5vh] w-[75vw] mt-[6vh]">

        {/* Messaggio utente */}
        <motion.div className="flex justify-end"
          initial={{ opacity:0, x:40 }}
          animate={phase>=2 ? { opacity:1, x:0 } : { opacity:0, x:40 }}
          transition={{ type:'spring', stiffness:220 }}
        >
          <div className="px-[2.5vw] py-[1.8vh] rounded-[2vw] rounded-br-sm bg-[#0ea5e9] max-w-[55vw]">
            <p className="text-[2.2vw] font-semibold text-white" style={{ fontFamily:'Inter, sans-serif' }}>
              Che esca uso per il branzino di sera?
            </p>
          </div>
        </motion.div>

        {/* Risposta AI */}
        <AnimatePresence>
          {showAI && (
            <motion.div className="flex justify-start items-start gap-[2vw]"
              initial={{ opacity:0, x:-40, scale:0.95 }}
              animate={{ opacity:1, x:0, scale:1 }}
              transition={{ type:'spring', stiffness:180, damping:20 }}
            >
              <div className="w-[5vw] h-[5vw] rounded-full bg-[#a78bfa] flex-shrink-0 flex items-center justify-center text-[2.2vw] shadow-[0_0_20px_rgba(167,139,250,0.5)]">
                🎣
              </div>
              <div className="px-[2.5vw] py-[2vh] rounded-[2vw] rounded-tl-sm border border-[#a78bfa]/30 bg-gradient-to-br from-[#a78bfa]/15 to-[#051525]/80 backdrop-blur max-w-[60vw]">
                <p className="text-[2vw] text-white leading-relaxed" style={{ fontFamily:'Inter, sans-serif' }}>
                  Per il <span className="text-[#0ea5e9] font-bold">branzino serale</span> usa artificiali minnow{' '}
                  <span className="text-[#f59e0b] font-bold">7-10 cm</span>, azione lenta vicino alla superficie.
                  Ore d'oro: <span className="text-[#34d399] font-bold">tramonto ±1h</span>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div className="absolute bottom-[10vh] right-[5vw] bg-[#a78bfa] text-white px-[3vw] py-[1.5vh] rounded-[1vw] -rotate-2 shadow-2xl"
        initial={{ opacity:0, scale:0 }}
        animate={phase>=3 ? { opacity:1, scale:1, rotate:-2 } : { opacity:0, scale:0 }}
        transition={{ type:'spring', stiffness:300, damping:15 }}
      >
        <span className="text-[2.2vw] font-black uppercase" style={{ fontFamily:'Inter, sans-serif' }}>Risponde in 2 secondi</span>
      </motion.div>
    </motion.div>
  );
}
