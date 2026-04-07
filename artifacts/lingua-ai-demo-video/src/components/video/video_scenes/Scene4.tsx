import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Title
      setTimeout(() => setPhase(2), 2000),  // Sentence
      setTimeout(() => setPhase(3), 4000),  // Colors + Tags
      setTimeout(() => setPhase(4), 8000),  // Subtitle
      setTimeout(() => setPhase(5), 12000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const words = [
    { text: "Ich", color: "#10b981", tag: "Soggetto", delay: 0 },
    { text: "habe", color: "#fb923c", tag: "Ausiliare", delay: 0.2 },
    { text: "gestern", color: "#a855f7", tag: "Tempo", delay: 0.4 },
    { text: "einen Film", color: "#3b82f6", tag: "Oggetto", delay: 0.6 },
    { text: "gesehen", color: "#fb923c", tag: "Verbo", delay: 0.8 }
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[6vw]"
      initial={{ opacity: 0, x: '100vw' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: '-50vh' }}
      transition={{ duration: 1.2, type: "spring", stiffness: 100, damping: 20 }}
    >
      <motion.div
        className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-[5vw] font-black leading-none text-white uppercase">
          X-Ray <span className="text-[#fb923c]">Grammaticale</span>
        </h2>
      </motion.div>

      <div className="w-full max-w-[80vw] mt-[10vh]">
        <div className="flex flex-wrap justify-center gap-x-[2vw] gap-y-[10vh] relative">
          {words.map((w, i) => (
            <div key={i} className="flex flex-col items-center relative">
              {/* Tag (Appears later) */}
              <motion.div
                className="absolute -top-[8vh] bg-white/10 px-[1vw] py-[0.5vh] rounded-[0.5vw] border-2 backdrop-blur-md"
                style={{ borderColor: w.color, color: w.color }}
                initial={{ opacity: 0, y: '2vh', scale: 0.5 }}
                animate={phase >= 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: '2vh', scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, delay: phase >= 3 ? w.delay : 0 }}
              >
                <span className="text-[1.5vw] font-bold uppercase whitespace-nowrap">{w.tag}</span>
              </motion.div>

              {/* Connecting Line */}
              <motion.div
                className="absolute -top-[2vh] w-[0.2vw] bg-white/30"
                initial={{ height: 0 }}
                animate={phase >= 3 ? { height: '3vh' } : { height: 0 }}
                transition={{ duration: 0.3, delay: phase >= 3 ? w.delay + 0.1 : 0 }}
              />

              {/* Word */}
              <motion.span
                className="text-[6vw] font-black leading-none"
                initial={{ opacity: 0, y: '5vh' }}
                animate={{
                  opacity: phase >= 2 ? 1 : 0,
                  y: phase >= 2 ? 0 : '5vh',
                  color: phase >= 3 ? w.color : "#ffffff",
                  textShadow: phase >= 3 ? `0 0 30px ${w.color}80` : "none"
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: phase >= 2 && phase < 3 ? i * 0.1 : 0 },
                  y: { duration: 0.5, delay: phase >= 2 && phase < 3 ? i * 0.1 : 0 },
                  color: { duration: 0.8, delay: phase >= 3 ? w.delay : 0 },
                  textShadow: { duration: 0.8, delay: phase >= 3 ? w.delay : 0 }
                }}
              >
                {w.text}
              </motion.span>
            </div>
          ))}
        </div>
      </div>

      {/* Subtitle */}
      <motion.div
        className="absolute bottom-[10vh] bg-white text-[#0f172a] px-[3vw] py-[2vh] rounded-[1vw] shadow-[0_0_50px_rgba(255,255,255,0.3)] rotate-[-2deg]"
        initial={{ opacity: 0, scale: 0 }}
        animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <span className="text-[3vw] font-black uppercase">Capisci la struttura all'istante</span>
      </motion.div>
    </motion.div>
  );
}
