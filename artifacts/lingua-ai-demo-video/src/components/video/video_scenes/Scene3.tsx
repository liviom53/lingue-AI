import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),   // Main sentence
      setTimeout(() => setPhase(2), 1000),  // X-Ray split
      setTimeout(() => setPhase(3), 2000),  // DeepSeek Tutor panel
      setTimeout(() => setPhase(4), 3200),  // Typing explanation
      setTimeout(() => setPhase(5), 4400),  // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const sentence = [
    { word: "I", color: "text-white", tag: "Pronoun" },
    { word: "missed", color: "text-[#fb923c]", tag: "Verb (Past)" },
    { word: "the", color: "text-white", tag: "Article" },
    { word: "train", color: "text-[#10b981]", tag: "Noun" }
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full"
      initial={{ opacity: 0, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: '-20vh', filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Title */}
      <motion.div
        className="absolute top-20 left-20"
        initial={{ opacity: 0, x: -30 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-[3vw] font-black leading-tight text-white mb-2">
          Analisi <span className="text-[#a855f7]">X-Ray</span>
        </h2>
        <p className="text-[1.5vw] text-white/70">
          Tocca qualsiasi parola per capirne la grammatica
        </p>
      </motion.div>

      {/* Main interactive area */}
      <div className="w-full max-w-6xl mt-10">
        
        {/* The Sentence with X-Ray breakdown */}
        <div className="flex justify-center gap-4 mb-16 relative">
          {sentence.map((item, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center"
              initial={{ y: 0 }}
              animate={phase >= 2 ? { y: i % 2 === 0 ? -20 : 20 } : { y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: phase >= 2 ? i * 0.1 : 0 }}
            >
              <motion.span 
                className={`text-[5vw] font-black tracking-tight ${item.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                {item.word}
              </motion.span>
              
              {/* Grammatical Tag */}
              <motion.div
                className="mt-2 px-3 py-1 rounded border border-white/20 bg-white/5 text-[1vw] text-white/80 whitespace-nowrap"
                initial={{ opacity: 0, scale: 0.5, y: -10 }}
                animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: phase >= 2 ? i * 0.1 + 0.2 : 0 }}
              >
                {item.tag}
              </motion.div>
              
              {/* Connection Line */}
              <motion.div
                className="w-[1px] bg-white/20 absolute h-12"
                style={{ top: i % 2 === 0 ? '80%' : '-40%' }}
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
              />
            </motion.div>
          ))}

          {/* Highlight ring on "missed" */}
          <motion.div
            className="absolute border-2 border-[#fb923c] rounded-lg"
            style={{ width: '22%', height: '140%', left: '20%', top: '-20%' }}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.2 }}
            transition={{ type: "spring", delay: 0.5 }}
          />
        </div>

        {/* AI Tutor Chat Panel */}
        <motion.div
          className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mx-auto max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 50, rotateX: -20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#fb923c] flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">AI Tutor DeepSeek</div>
              <div className="text-[#a855f7] text-sm">Spiegazione grammaticale</div>
            </div>
          </div>
          
          <div className="text-[1.3vw] text-white/90 leading-relaxed font-mono relative">
            <motion.div
              initial={{ width: "0%" }}
              animate={phase >= 4 ? { width: "100%" } : { width: "0%" }}
              transition={{ duration: 1.5, ease: "linear" }}
              className="overflow-hidden whitespace-nowrap border-r-2 border-[#fb923c]"
            >
              "Missed" è il passato semplice di "miss".
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-2 text-white/60"
            >
              In inglese si usa per esprimere la perdita di un mezzo di trasporto o la mancanza di una persona.
            </motion.div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
