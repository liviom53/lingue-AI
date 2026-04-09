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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Refs DOM per animazioni beat dirette (no re-render)
  const pulseRing1Ref = useRef<HTMLDivElement>(null);
  const pulseRing2Ref = useRef<HTMLDivElement>(null);
  const blobBeatRef = useRef<HTMLDivElement>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef<number>(0);

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

  // ── Audio analyzer loop ─────────────────────────────────────────
  useEffect(() => {
    if (!audioPlaying) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }

    const analyser = analyserRef.current!;
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    const canvas = canvasRef.current;
    const ctx2d = canvas?.getContext('2d');
    const BAR_COUNT = 64;

    const tick = () => {
      analyser.getByteFrequencyData(data);

      // Energia basso (0–10% dello spettro) → beat
      const bassEnd = Math.floor(bufLen * 0.08);
      let bassSum = 0;
      for (let i = 0; i < bassEnd; i++) bassSum += data[i];
      const bass = Math.min(1, bassSum / (bassEnd * 220));

      // Energia media (mids) → viola
      const midEnd = Math.floor(bufLen * 0.45);
      let midSum = 0;
      for (let i = bassEnd; i < midEnd; i++) midSum += data[i];
      const mid = Math.min(1, midSum / ((midEnd - bassEnd) * 200));

      // ── Anello 1 (basso, arancione) ─────────────────────────────
      if (pulseRing1Ref.current) {
        const s = 1 + bass * 0.45;
        pulseRing1Ref.current.style.transform = `translate(-50%,-50%) scale(${s})`;
        pulseRing1Ref.current.style.opacity = `${0.08 + bass * 0.55}`;
        pulseRing1Ref.current.style.boxShadow = `0 0 ${40 + bass * 80}px rgba(251,146,60,${0.2 + bass * 0.4})`;
      }
      // ── Anello 2 (medi, viola, controfase) ─────────────────────
      if (pulseRing2Ref.current) {
        const s = 1 + mid * 0.35 + (1 - bass) * 0.1;
        pulseRing2Ref.current.style.transform = `translate(-50%,-50%) scale(${s})`;
        pulseRing2Ref.current.style.opacity = `${0.06 + mid * 0.4}`;
        pulseRing2Ref.current.style.boxShadow = `0 0 ${30 + mid * 60}px rgba(168,85,247,${0.15 + mid * 0.35})`;
      }
      // ── Blob beat (overlay sopra i blob gradiente) ──────────────
      if (blobBeatRef.current) {
        blobBeatRef.current.style.opacity = `${bass * 0.25}`;
        blobBeatRef.current.style.transform = `translate(-50%,-50%) scale(${1 + bass * 0.8})`;
      }

      // ── Canvas equalizer ────────────────────────────────────────
      if (canvas && ctx2d) {
        const W = canvas.width;
        const H = canvas.height;
        ctx2d.clearRect(0, 0, W, H);

        const step = Math.floor(bufLen / BAR_COUNT);
        const barW = W / BAR_COUNT;

        for (let i = 0; i < BAR_COUNT; i++) {
          let s = 0;
          for (let j = 0; j < step; j++) s += data[i * step + j];
          const val = s / step / 255;
          const barH = Math.max(2, val * H * 0.92);
          const x = i * barW;
          const y = H - barH;

          // Colore: basse freq = arancione (#fb923c), alte = viola/blu
          const t = i / BAR_COUNT;
          const r = Math.round(251 * (1 - t) + 59 * t);
          const g = Math.round(146 * (1 - t) + 130 * t);
          const bC = Math.round(60 * (1 - t) + 246 * t);
          const alpha = 0.55 + val * 0.45;

          const grad = ctx2d.createLinearGradient(x, y, x, H);
          grad.addColorStop(0, `rgba(${r},${g},${bC},${alpha})`);
          grad.addColorStop(0.7, `rgba(${r},${g},${bC},${alpha * 0.5})`);
          grad.addColorStop(1, `rgba(${r},${g},${bC},0.05)`);
          ctx2d.fillStyle = grad;

          const rad = Math.min(barW * 0.4, 4);
          ctx2d.beginPath();
          ctx2d.roundRect(x + 1.5, y, barW - 3, barH, [rad, rad, 0, 0]);
          ctx2d.fill();

          // Piccolo riflesso invertito
          const gradR = ctx2d.createLinearGradient(x, H, x, H + barH * 0.3);
          gradR.addColorStop(0, `rgba(${r},${g},${bC},${alpha * 0.25})`);
          gradR.addColorStop(1, `rgba(${r},${g},${bC},0)`);
          ctx2d.fillStyle = gradR;
          ctx2d.beginPath();
          ctx2d.roundRect(x + 1.5, H, barW - 3, barH * 0.28, [0, 0, rad, rad]);
          ctx2d.fill();
        }

        // Linea di base luminosa
        ctx2d.strokeStyle = `rgba(251,146,60,${0.15 + bass * 0.4})`;
        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        ctx2d.moveTo(0, H);
        ctx2d.lineTo(W, H);
        ctx2d.stroke();
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [audioPlaying]);

  const toggleFullscreen = async () => {
    const el = containerRef.current as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
      webkitFullscreenEnabled?: boolean;
    };
    const canFs = document.fullscreenEnabled || doc.webkitFullscreenEnabled;
    if (!canFs) { setFsUnsupported(true); setTimeout(() => setFsUnsupported(false), 3500); return; }
    const inFs = !!(document.fullscreenElement || doc.webkitFullscreenElement);
    try {
      if (!inFs) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      }
    } catch { setFsUnsupported(true); setTimeout(() => setFsUnsupported(false), 3500); }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPause = () => setAudioPlaying(false);
    audio.addEventListener('pause', onPause);
    return () => audio.removeEventListener('pause', onPause);
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

  const pos = bgPositions[currentScene];

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#060d1a] text-white">

      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/paulyudin-rock-490391.mp3`} loop muted />

      {/* ── Pulsante audio ──────────────────────────────────────── */}
      <AnimatePresence>
        {!audioPlaying && (
          <motion.button
            onClick={startAudio}
            className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-sm font-bold px-4 py-2 rounded-full cursor-pointer"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <span>🎵</span> Avvia audio
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {audioPlaying && (
          <motion.div
            className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-[#fb923c]/20 border border-[#fb923c]/50 text-[#fb923c] text-xs font-black px-4 py-2 rounded-full tracking-widest uppercase"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.4, repeat: Infinity }}>▐▌</motion.span>
            Rock ON
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Background video ────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-25 mix-blend-screen">
        <video src={`${import.meta.env.BASE_URL}videos/bg-loop.mp4`} autoPlay muted loop playsInline className="w-full h-full object-cover" />
      </div>

      {/* ── Blob arancione (lento, scene-driven) ────────────────── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '85vw', height: '85vw', borderRadius: '50%',
          background: 'radial-gradient(circle, #fb923c, transparent 70%)',
          top: '-25%', left: '-15%', filter: 'blur(80px)',
        }}
        animate={{ x: pos.x, y: pos.y, scale: pos.scale, opacity: 0.32 }}
        transition={{ duration: 8, ease: 'easeInOut' }}
      />

      {/* ── Blob viola (lento, controfase) ──────────────────────── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '75vw', height: '75vw', borderRadius: '50%',
          background: 'radial-gradient(circle, #a855f7, transparent 70%)',
          bottom: '-15%', right: '-15%', filter: 'blur(80px)',
        }}
        animate={{ x: pos.y, y: pos.x, scale: bgPositions[(currentScene + 3) % 8].scale, opacity: 0.28 }}
        transition={{ duration: 10, ease: 'easeInOut' }}
      />

      {/* ── Blob blu (statico, alti) ─────────────────────────────── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, #3b82f6, transparent 70%)',
          top: '20%', left: '30%', filter: 'blur(100px)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Beat ring 1 — basso/arancione (DOM diretto) ─────────── */}
      <div
        ref={pulseRing1Ref}
        className="absolute pointer-events-none"
        style={{
          width: '110vw', height: '110vw', borderRadius: '50%',
          border: '1.5px solid rgba(251,146,60,0.5)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%) scale(1)',
          opacity: 0,
          willChange: 'transform, opacity, box-shadow',
          transition: 'transform 0.05s linear, opacity 0.05s linear, box-shadow 0.05s linear',
        }}
      />

      {/* ── Beat ring 2 — medi/viola (DOM diretto) ──────────────── */}
      <div
        ref={pulseRing2Ref}
        className="absolute pointer-events-none"
        style={{
          width: '90vw', height: '90vw', borderRadius: '50%',
          border: '1px solid rgba(168,85,247,0.4)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%) scale(1)',
          opacity: 0,
          willChange: 'transform, opacity, box-shadow',
          transition: 'transform 0.08s linear, opacity 0.08s linear, box-shadow 0.08s linear',
        }}
      />

      {/* ── Flash beat overlay ───────────────────────────────────── */}
      <div
        ref={blobBeatRef}
        className="absolute pointer-events-none"
        style={{
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,146,60,0.4), transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%) scale(1)',
          opacity: 0,
          filter: 'blur(40px)',
          willChange: 'transform, opacity',
          transition: 'transform 0.05s linear, opacity 0.05s linear',
        }}
      />

      {/* ── Grid texture ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '4vw 4vw'
        }}
      />

      {/* ── Canvas equalizer (bottom) ─────────────────────────────── */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={140}
        className="absolute bottom-0 left-0 w-full z-20 pointer-events-none"
        style={{ opacity: audioPlaying ? 1 : 0, transition: 'opacity 0.8s ease' }}
      />

      {/* ── Pulsante fullscreen ──────────────────────────────────── */}
      <motion.button
        onClick={toggleFullscreen}
        className="absolute bottom-16 right-4 z-50 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-full cursor-pointer"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        title={isFullscreen ? 'Esci' : 'Tutto schermo'}
      >
        ⛶ {isFullscreen ? 'Esci' : 'Schermo intero'}
      </motion.button>

      <AnimatePresence>
        {fsUnsupported && (
          <motion.div
            className="absolute bottom-28 right-4 z-50 bg-black/70 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-xl max-w-[220px] text-center"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          >
            Il tutto schermo non è disponibile — apri il video direttamente nel browser
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scene ────────────────────────────────────────────────── */}
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
