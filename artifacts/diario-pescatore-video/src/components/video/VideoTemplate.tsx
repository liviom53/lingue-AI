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

type RecordingState = 'idle' | 'preparing' | 'recording' | 'done' | 'unsupported' | 'cancelled';

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

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

const isInIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();

function IframeCopyButton() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      prompt('Copia questo link e aprilo in una nuova scheda:', window.location.href);
    }
  };
  return (
    <motion.button
      onClick={copy}
      className={`flex items-center gap-2 backdrop-blur border text-sm font-bold px-4 py-2 rounded-full cursor-pointer transition-all duration-300 ${
        copied
          ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300'
          : 'bg-purple-500/20 border-purple-400/50 text-purple-300 hover:bg-purple-500/35'
      }`}
      initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay:0.08 }}
      style={{ fontFamily:'Inter, sans-serif' }}
    >
      {copied ? <><span>✅</span> Link copiato!</> : <><span>↗</span> Apri in nuova scheda</>}
    </motion.button>
  );
}

export default function VideoTemplate() {
  const [videoPaused, setVideoPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS, paused: videoPaused, resetKey });
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsUnsupported, setFsUnsupported] = useState(false);

  /* ── Registrazione ───────────────────────────────────────────── */
  const [recState, setRecState] = useState<RecordingState>('idle');
  const [recTimer, setRecTimer] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wantRecordRef = useRef(false);
  const displayStreamRef = useRef<MediaStream | null>(null);

  const startMediaRecorder = (stream: MediaStream) => {
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus' : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'diario-pescatore-demo.webm';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setRecState('done'); wantRecordRef.current = false;
      setTimeout(() => setRecState('idle'), 4000);
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    setRecState('recording'); setRecTimer(0);
    timerRef.current = setInterval(() => setRecTimer(t => t + 1), 1000);
  };

  useEffect(() => {
    window.startRecording = async () => {
      if (!wantRecordRef.current) return;
      const stream = displayStreamRef.current;
      displayStreamRef.current = null;
      if (!stream) return;
      startMediaRecorder(stream);
    };
    window.stopRecording = () => {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
    return () => { delete window.startRecording; delete window.stopRecording; };
  }, []);

  /* ── Audio ──────────────────────────────────────────────────── */
  const startAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = false;
    a.volume = 0.65;
    a.play().then(() => setAudioPlaying(true)).catch(() => {});
  };

  const stopAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setAudioPlaying(false);
  };

  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 } as MediaTrackConstraints,
        audio: true,
      });
      displayStreamRef.current = stream;
      wantRecordRef.current = true;
      setRecState('preparing'); setRecTimer(0);
      startAudio();
      setResetKey(k => k + 1);
    } catch (err: unknown) {
      const name = (err as DOMException)?.name;
      setRecState(name === 'NotAllowedError' || name === 'AbortError' ? 'cancelled' : 'unsupported');
    }
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPause = () => setAudioPlaying(false);
    a.addEventListener('pause', onPause);
    return () => a.removeEventListener('pause', onPause);
  }, []);

  useEffect(() => {
    const onHide = () => stopAudio();
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  /* ── Fullscreen ─────────────────────────────────────────────── */
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

      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/mixkit-country-rock.mp3`} loop muted />

      {/* ── Blob teal ──────────────────────────────────────────── */}
      <motion.div className="absolute pointer-events-none"
        style={{ width:'70vw', height:'70vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(14,165,233,0.13), transparent 70%)',
          top:'5%', left:'-15%', filter:'blur(90px)' }}
        animate={{ x:['0%','18%','0%'], y:['0%','12%','0%'] }}
        transition={{ duration:14, repeat:Infinity, ease:'easeInOut' }}
      />

      {/* ── Blob amber ─────────────────────────────────────────── */}
      <motion.div className="absolute pointer-events-none"
        style={{ width:'55vw', height:'55vw', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%)',
          bottom:'-15%', right:'-10%', filter:'blur(100px)' }}
        animate={{ x:['0%','-12%','0%'], y:['0%','-10%','0%'] }}
        transition={{ duration:18, repeat:Infinity, ease:'easeInOut', delay:4 }}
      />

      {/* ── Griglia ────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{ backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize:'5vw 5vw' }}
      />

      {/* ── Onde ────────────────────────────────────────────────── */}
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

      {/* ── Barra controlli (top-right) ─────────────────────────── */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 flex-wrap justify-end">

        {/* Bottone Avvia / Ferma (audio + video insieme) */}
        <motion.button
          onClick={() => {
            if (videoPaused) { setVideoPaused(false); startAudio(); }
            else             { setVideoPaused(true);  stopAudio();  }
          }}
          className={`flex items-center gap-2 backdrop-blur border text-sm font-bold px-4 py-2 rounded-full cursor-pointer transition-all duration-300 ${
            videoPaused
              ? 'bg-[#f59e0b]/25 border-[#f59e0b]/60 text-[#f59e0b] hover:bg-[#f59e0b]/35'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          }`}
          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ fontFamily:'Inter, sans-serif' }}
        >
          <span>{videoPaused ? '▶' : '⏸'}</span>
          {videoPaused ? 'Avvia' : 'Ferma'}
        </motion.button>

        {/* Bottone Registra / Copia link se in iframe */}
        {isInIframe ? (
          <IframeCopyButton />
        ) : (
          <motion.button
            onClick={recState !== 'preparing' && recState !== 'recording' ? handleRecord : undefined}
            disabled={recState === 'preparing' || recState === 'recording'}
            className={`flex items-center gap-2 backdrop-blur border text-sm font-bold px-4 py-2 rounded-full transition-all duration-300 ${
              recState === 'recording' ? 'bg-red-500/30 border-red-400/70 text-red-300 cursor-default animate-pulse'
              : recState === 'done' ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300 cursor-pointer'
              : recState === 'preparing' ? 'bg-purple-500/20 border-purple-400/50 text-purple-300 cursor-default'
              : recState === 'unsupported' ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 cursor-pointer'
              : recState === 'cancelled' ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 cursor-pointer'
              : 'bg-purple-500/20 border-purple-400/50 text-purple-300 hover:bg-purple-500/35 cursor-pointer'
            }`}
            initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay:0.08 }}
            style={{ fontFamily:'Inter, sans-serif' }}
          >
            {recState === 'recording' && <><span>⏺</span> {fmtTime(recTimer)} — Registrazione in corso</>}
            {recState === 'preparing' && <><span>⏳</span> Preparazione…</>}
            {recState === 'done' && <><span>✅</span> Download avviato — Registra ancora</>}
            {recState === 'unsupported' && <><span>⚠️</span> Browser non supportato</>}
            {recState === 'cancelled' && <><span>↩</span> Annullato — riprova</>}
            {recState === 'idle' && <><span>⏺</span> Registra video</>}
          </motion.button>
        )}

        {/* Bottone Schermo intero */}
        <motion.button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-bold px-4 py-2 rounded-full cursor-pointer hover:bg-white/20 transition-all duration-300"
          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay:0.1 }}
          style={{ fontFamily:'Inter, sans-serif' }}
        >
          <span>{isFullscreen ? '⊡' : '⛶'}</span>
          {isFullscreen ? 'Riduci' : 'Schermo intero'}
        </motion.button>
      </div>

      {/* Overlay pausa */}
      <AnimatePresence>
        {videoPaused && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.3 }}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-8"
              style={{ boxShadow:'0 0 60px rgba(245,158,11,0.3)' }}>
              <span className="text-[8vw] text-[#f59e0b]" style={{ lineHeight:1 }}>⏸</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fsUnsupported && (
          <motion.div
            className="absolute top-16 right-4 z-50 bg-black/70 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-xl max-w-[220px] text-center"
            initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            style={{ fontFamily:'Inter, sans-serif' }}
          >
            Fullscreen non disponibile
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scene ───────────────────────────────────────────────── */}
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
