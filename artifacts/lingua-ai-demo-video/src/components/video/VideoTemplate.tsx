import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';

const SCENE_DURATIONS = { 
  hook: 13000, 
  translate: 13000, 
  xray: 12000, 
  grammar: 13000, 
  shadowing: 13000,
  quiz: 12000,
  accessibility: 13000,
  outro: 13000 
};

const bgPositions = [
  { x: '-10%', y: '-10%', scale: 1, rotate: 0 },
  { x: '10%', y: '20%', scale: 1.2, rotate: 45 },
  { x: '-20%', y: '30%', scale: 0.9, rotate: 90 },
  { x: '30%', y: '-10%', scale: 1.3, rotate: 135 },
  { x: '0%', y: '0%', scale: 1, rotate: 180 },
  { x: '15%', y: '15%', scale: 1.1, rotate: 225 },
  { x: '-5%', y: '-5%', scale: 1.4, rotate: 270 },
  { x: '20%', y: '-20%', scale: 1.2, rotate: 315 },
];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsUnsupported, setFsUnsupported] = useState(false);

  const startAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.volume = 0.7;
    audio.play().then(() => setAudioPlaying(true)).catch(() => {});
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
      webkitFullscreenEnabled?: boolean;
    };
    const canFs = document.fullscreenEnabled || doc.webkitFullscreenEnabled;
    if (!canFs) {
      setFsUnsupported(true);
      setTimeout(() => setFsUnsupported(false), 3500);
      return;
    }
    const inFs = !!(document.fullscreenElement || doc.webkitFullscreenElement);
    try {
      if (!inFs) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch {
      setFsUnsupported(true);
      setTimeout(() => setFsUnsupported(false), 3500);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setAudioPlaying(false);
    audio.addEventListener('pause', onEnded);
    return () => audio.removeEventListener('pause', onEnded);
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      setIsFullscreen(!!(document.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#0f172a] text-white">
      
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/paulyudin-rock-490391.mp3`} loop muted />

      {/* Pulsante Avvia Audio */}
      <AnimatePresence>
        {!audioPlaying && (
          <motion.button
            onClick={startAudio}
            className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-sm font-bold px-4 py-2 rounded-full cursor-pointer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-base">🎵</span> Avvia audio
          </motion.button>
        )}
      </AnimatePresence>

      {/* Indicatore audio attivo */}
      <AnimatePresence>
        {audioPlaying && (
          <motion.div
            className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-sm font-bold px-4 py-2 rounded-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >●</motion.span> Audio ON
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Video Loop */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen">
        <video 
          src={`${import.meta.env.BASE_URL}videos/bg-loop.mp4`}
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Persistent Animated Gradient Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, #fb923c, transparent 70%)', top: '-20%', left: '-10%' }}
          animate={bgPositions[currentScene]}
          transition={{ duration: 8, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-[70vw] h-[70vw] rounded-full blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', bottom: '-10%', right: '-10%' }}
          animate={{
            x: bgPositions[currentScene].y, 
            y: bgPositions[currentScene].x,
            scale: bgPositions[currentScene].scale,
          }}
          transition={{ duration: 9, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)', top: '20%', left: '30%' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid overlay for texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '4vw 4vw'
        }}
      />

      {/* Pulsante Tutto Schermo / Esci */}
      <motion.button
        onClick={toggleFullscreen}
        className="absolute bottom-4 right-4 z-50 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-sm font-bold px-4 py-2 rounded-full cursor-pointer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        title={isFullscreen ? 'Esci da tutto schermo' : 'Tutto schermo'}
      >
        {isFullscreen ? (
          <><span className="text-base">⛶</span> Esci</>
        ) : (
          <><span className="text-base">⛶</span> Tutto schermo</>
        )}
      </motion.button>

      {/* Messaggio non supportato */}
      <AnimatePresence>
        {fsUnsupported && (
          <motion.div
            className="absolute bottom-16 right-4 z-50 bg-black/70 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-xl max-w-[220px] text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            Il tutto schermo non è disponibile — apri il video direttamente nel browser
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="hook" />}
        {currentScene === 1 && <Scene2 key="translate" />}
        {currentScene === 2 && <Scene3 key="xray" />}
        {currentScene === 3 && <Scene4 key="grammar" />}
        {currentScene === 4 && <Scene5 key="shadowing" />}
        {currentScene === 5 && <Scene6 key="quiz" />}
        {currentScene === 6 && <Scene8 key="accessibility" />}
        {currentScene === 7 && <Scene7 key="outro" />}
      </AnimatePresence>
    </div>
  );
}
