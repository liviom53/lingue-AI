import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Word appears
      setTimeout(() => setPhase(2), 2500),  // IPA starts revealing
      setTimeout(() => setPhase(3), 5000),  // Audio waves
      setTimeout(() => setPhase(4), 8500),  // Text
      setTimeout(() => setPhase(5), 11000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const ipaChars = "[ ˈ d a ŋ k ə ˌ ʃ ø ː n ]".split(' ');

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, rotateX: -20, scale: 0.8 }}
      animate={{ opacity: 1, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, rotateY: 90, scale: 1.5 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Decorative Waveforms Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="w-[1vw] bg-[#a855f7] mx-[0.5vw] rounded-full"
            initial={{ height: '2vh' }}
            animate={phase >= 3 ? {
              height: `${10 + Math.random() * 80}vh`
            } : { height: '2vh' }}
            transition={{
              duration: 0.4 + Math.random() * 0.4,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: phase >= 3 ? i * 0.05 : 0
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        {/* Main Word */}
        <motion.h2
          className="text-[10vw] font-black text-white leading-none mb-[4vh] drop-shadow-2xl"
          initial={{ opacity: 0, y: '5vh' }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: '5vh' }}
          transition={{ duration: 1, type: "spring" }}
        >
          Dankeschön
        </motion.h2>

        {/* IPA Transcription */}
        <div className="text-[6vw] font-mono text-[#a855f7] font-bold bg-[#0f172a]/80 px-[6vw] py-[3vh] rounded-[2vw] border-[0.3vw] border-[#a855f7]/30 inline-block shadow-[0_0_100px_rgba(168,85,247,0.4)]">
          {ipaChars.map((char, i) => (
            <motion.span
              key={i}
              className="inline-block mx-[0.5vw]"
              initial={{ opacity: 0, scale: 0, y: '2vh' }}
              animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0, y: '2vh' }}
              transition={{
                duration: 0.4,
                delay: phase >= 2 ? i * 0.15 : 0,
                type: "spring",
                stiffness: 400
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Badge */}
        <motion.div
          className="mt-[8vh]"
          initial={{ opacity: 0, y: '3vh' }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: '3vh' }}
          transition={{ duration: 0.8 }}
        >
          <span className="bg-white text-[#0f172a] text-[3vw] font-black uppercase px-[4vw] py-[2vh] rounded-[1vw]">
            Pronuncia perfetta con IPA
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
