import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Title
      setTimeout(() => setPhase(2), 2000),  // Original text
      setTimeout(() => setPhase(3), 4000),  // Translations sequence
      setTimeout(() => setPhase(4), 10000), // "29+ lingue"
      setTimeout(() => setPhase(5), 12000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const translations = [
    { lang: "Inglese", flag: "🇬🇧", text: "Where is the station?" },
    { lang: "Spagnolo", flag: "🇪🇸", text: "¿Dónde está la estación?" },
    { lang: "Francese", flag: "🇫🇷", text: "Où est la gare ?" },
    { lang: "Tedesco", flag: "🇩🇪", text: "Wo ist der Bahnhof?" },
    { lang: "Giapponese", flag: "🇯🇵", text: "駅はどこですか？" }
  ];

  const [activeLang, setActiveLang] = useState(0);

  useEffect(() => {
    if (phase >= 3 && phase < 5) {
      const interval = setInterval(() => {
        setActiveLang(prev => (prev + 1) % translations.length);
      }, 1200); // cycle through languages
      return () => clearInterval(interval);
    }
  }, [phase, translations.length]);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.1, y: '10vh' }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute top-[8vh] left-[5vw]"
        initial={{ opacity: 0, x: -50 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-[5vw] font-black leading-none text-white uppercase">
          Traduzione <span className="text-[#3b82f6]">Slick</span>
        </h2>
      </motion.div>

      <div className="w-[80vw] mt-[10vh]">
        {/* Original Italian Text */}
        <motion.div
          className="bg-white/5 border-2 border-white/20 p-[3vw] rounded-[2vw] mb-[5vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="flex items-center gap-[1vw] mb-[2vh]">
            <span className="text-[3vw]">🇮🇹</span>
            <span className="text-[#94a3b8] text-[1.5vw] font-bold uppercase">Italiano</span>
          </div>
          <p className="text-[4vw] font-black tracking-tight text-white leading-none">Dove si trova la stazione?</p>
        </motion.div>

        {/* Translation Cycler */}
        <div className="relative h-[25vh]">
          <AnimatePresence mode="wait">
            {phase >= 3 && (
              <motion.div
                key={activeLang}
                className="bg-gradient-to-r from-[#3b82f6]/20 to-[#a855f7]/20 border-2 border-[#3b82f6]/40 p-[3vw] rounded-[2vw] absolute inset-0 shadow-[0_0_50px_rgba(59,130,246,0.3)]"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-[1vw] mb-[2vh]">
                  <span className="text-[3vw]">{translations[activeLang].flag}</span>
                  <span className="text-[#93c5fd] text-[1.5vw] font-bold uppercase">{translations[activeLang].lang}</span>
                </div>
                <p className="text-[4.5vw] font-black tracking-tight text-white leading-none text-gradient">
                  {translations[activeLang].text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 29+ Lingue Badge */}
        <motion.div
          className="absolute bottom-[10vh] right-[5vw] bg-[#a855f7] text-white px-[3vw] py-[2vh] rounded-[1vw] rotate-3 shadow-2xl"
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1, rotate: 3 } : { opacity: 0, scale: 0, rotate: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <span className="text-[3vw] font-black uppercase">29+ lingue disponibili</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
