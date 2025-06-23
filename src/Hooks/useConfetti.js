import { useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

export function useConfetti(activeSessionId, activeSessionTimes, bestTime) {
  const prevBestTimeRef = useRef(null);

  const fireConfetti = useCallback(() => {
    const duration = 1000; // 1 segundo
    const end = Date.now() + duration;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const shapes = ['square', 'circle', 'line', 'star'];

    (function frame() {
      confetti({
        particleCount: 8 + Math.floor(Math.random() * 12),
        startVelocity: 30 + Math.random() * 20,
        angle: Math.random() * 360,
        spread: 80 + Math.random() * 20,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors,
        shapes,
        ticks: 200 + Math.floor(Math.random() * 100),
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Resetear prevBestTime cuando cambia la sesión activa
  useEffect(() => {
    prevBestTimeRef.current = null;
  }, [activeSessionId]);

  // Detectar mejora y lanzar confetti
  useEffect(() => {
    if (activeSessionTimes.length === 0) {
      prevBestTimeRef.current = null;
      return;
    }

    if (
      bestTime !== null &&
      prevBestTimeRef.current !== null &&
      bestTime < prevBestTimeRef.current
    ) {
      fireConfetti();
    }

    prevBestTimeRef.current = bestTime;
  }, [activeSessionTimes, bestTime, fireConfetti]);
}
