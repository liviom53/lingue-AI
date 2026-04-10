import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    startRecording?: () => Promise<void>;
    stopRecording?: () => void;
  }
}

export interface SceneDurations {
  [key: string]: number;
}

export interface UseVideoPlayerOptions {
  durations: SceneDurations;
  onVideoEnd?: () => void;
  loop?: boolean;
  paused?: boolean;
  resetKey?: number;
}

export function useVideoPlayer({ durations, onVideoEnd, loop = true, paused = false, resetKey = 0 }: UseVideoPlayerOptions) {
  const sceneKeys = useRef(Object.keys(durations)).current;
  const durationsArray = useRef(Object.values(durations)).current;
  const [currentScene, setCurrentScene] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    window.startRecording?.();
  }, []);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    setCurrentScene(0);
    setHasEnded(false);
    setTimeout(() => window.startRecording?.(), 300);
  }, [resetKey]);

  useEffect(() => {
    if (hasEnded && !loop) return;
    if (paused) return;
    const timer = setTimeout(() => {
      if (currentScene >= sceneKeys.length - 1) {
        if (!hasEnded) {
          window.stopRecording?.();
          setHasEnded(true);
          onVideoEnd?.();
        }
        if (loop) setCurrentScene(0);
      } else {
        setCurrentScene(p => p + 1);
      }
    }, durationsArray[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene, durationsArray, hasEnded, loop, onVideoEnd, paused]);

  return { currentScene, currentSceneKey: sceneKeys[currentScene] };
}
