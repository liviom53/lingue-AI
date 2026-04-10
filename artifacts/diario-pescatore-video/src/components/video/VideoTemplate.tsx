import { useRef, useEffect, useState } from 'react';
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
import { Scene9 } from './video_scenes/Scene9';

const SCENE_DURATIONS = {
  intro:       13000,
  previsioni:  13000,
  guru:        13000,
  scanner:     13000,
  diario:      13000,
  chat:        13000,
  specie:      13000,
  statistiche: 13000,
  outro:       13000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsUnsupported, setFsUnsupported] = useState(false);

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

  const toggleFullscreen = async () => {
    const el = containerRef.current as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
      webkitFullscreenEnabled?: boolean;
    };
    const canFs = document.fullscreenEnabled || doc.webkitFullscreenEnabled;
    if (!canFs) { setFsUnsupported(true); setTimeout(() => setFsUnsupported(false), 3000); return; }
    const inFs = !!(document.fullscreenElement || doc.webkitFullscreenElement);
    try {
      if (!inFs) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      }
    } catch { setFsUnsupported(true); setTimeout(() => setFsUnsupported(false), 3000); }
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#051525] text-white">

      {/* Blob teal galleggiante */}
      <motion.div className="absolute pointer-events-none"
        style={{ width:'70vw', height:'70vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(14,165,233,0.13), transparent 70%)',
          top:'5%', left:'-15%', filter:'blur(90px)' }}
        animate={{ x:['0%','18%','0%'], y:['0%','12%','0%'] }}
        transition={{ duration:14, repeat:Infinity, ease:'easeInOut' }}
      />

      {/* Blob amber basso-destra */}
      <motion.div className="absolute pointer-events-none"
        style={{ width:'55vw', height:'55vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%)',
          bottom:'-15%', right:'-10%', filter:'blur(100px)' }}
        animate={{ x:['0%','-12%','0%'], y:['0%','-10%','0%'] }}
        transition={{ duration:18, repeat:Infinity, ease:'easeInOut', delay:4 }}
      />

      {/* Griglia decorativa */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{ backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize:'5vw 5vw' }}
      />

      {/* Onde in basso */}
      <svg className="absolute bottom-0 left-0 w-full pointer-events-none z-10"
        viewBox="0 0 1440 80" preserveAspectRatio="none"
        style={{ height:'8vh', opacity:0.12 }}>
        <motion.path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill="#0ea5e9"
          animate={{ d:[
            'M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z',
            'M0,55 C240,15 480,75 720,35 C960,5 1200,65 1440,35 L1440,80 L0,80 Z',
            'M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z',
          ]}}
          transition={{ duration:8, repeat:Infinity, ease:'easeInOut' }}
        />
      </svg>

      {/* Pulsante fullscreen */}
      <motion.button onClick={toggleFullscreen}
        className="absolute bottom-10 right-4 z-50 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-full cursor-pointer"
        initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      >
        {isFullscreen ? '✕ Esci' : '⛶ Schermo intero'}
      </motion.button>

      <AnimatePresence>
        {fsUnsupported && (
          <motion.div className="absolute bottom-24 right-4 z-50 bg-black/70 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-xl max-w-[220px] text-center"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}>
            Fullscreen non disponibile
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene */}
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="intro" />}
        {currentScene === 1 && <Scene2 key="previsioni" />}
        {currentScene === 2 && <Scene3 key="guru" />}
        {currentScene === 3 && <Scene4 key="scanner" />}
        {currentScene === 4 && <Scene5 key="diario" />}
        {currentScene === 5 && <Scene6 key="chat" />}
        {currentScene === 6 && <Scene7 key="specie" />}
        {currentScene === 7 && <Scene8 key="statistiche" />}
        {currentScene === 8 && <Scene9 key="outro" />}
      </AnimatePresence>
    </div>
  );
}
