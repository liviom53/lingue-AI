import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Anchor } from "lucide-react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500); // Wait for exit animation
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onClick={handleClick}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-background"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 opacity-40 mix-blend-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/splash-bg.png)` }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />

          {/* Content */}
          <div className="relative z-20 flex flex-col items-center text-center px-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-[0_0_60px_hsla(175,80%,40%,0.4)] mb-8"
            >
              <Anchor className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-display font-bold text-4xl md:text-6xl text-white tracking-tight mb-2"
            >
              Diario del<br/><span className="text-primary">Pescatore</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 mb-12"
            >
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-primary uppercase tracking-widest border border-white/10">
                v3.6
              </span>
              <span className="text-muted-foreground text-sm font-medium">by Limax</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-lg italic text-white/60 font-serif"
            >
              "Ad Maiora Semper"
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ delay: 2, duration: 2, repeat: Infinity }}
              className="absolute bottom-12 text-xs text-primary/60 uppercase tracking-[0.2em]"
            >
              Tocca per iniziare
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
