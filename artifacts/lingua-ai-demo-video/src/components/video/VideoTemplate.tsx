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

// Background gradient positions per scene for continuous motion
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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0f172a] text-white">
      
      {/* Background Audio — muted by default; un-mute manually before screen recording */}
      <audio src={`${import.meta.env.BASE_URL}audio/hard-rock-intro.mp3`} autoPlay loop muted />

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
