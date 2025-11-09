import { useState, useEffect } from "react";

export function useTheme() {
  // Detección de móvil solo una vez al montar
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Theme colors (still configurable)
  const [colors, setColors] = useState(() => ({
    bgColor: localStorage.getItem("bgColor") || "#ffffff",
    textColor: localStorage.getItem("textColor") || "#000000",
    scrambleColor: localStorage.getItem("scrambleColor") || "#000000",
  }));

  // Compute responsive sizes based on viewport. These are fixed (not user-configurable)
  const computeSizes = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    // Timer font size: scale with viewport width but clamp to reasonable range
    const timer = Math.round(Math.max(60, Math.min(220, vw * 0.18)));

    // Scramble font size: small relative to width
    const scramble = Math.round(Math.max(12, Math.min(30, vw * 0.045)));

  // Cube visual size (sticker size in px): base on smaller viewport dimension
  // Use a smaller scale so the cube is less intrusive on small screens
  const base = Math.min(vw, vh);
  const cube = Math.round(Math.max(8, Math.min(40, base * 0.05)));

    return { timer, scramble, cube };
  };

  const [sizes, setSizes] = useState(() => ({ ...computeSizes() }));

  // Update sizes on resize/orientation change
  useEffect(() => {
    const handleResize = () => setSizes(computeSizes());
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Apply CSS variables for colors. Timer and scramble sizes are controlled by CSS clamps in App.css
  useEffect(() => {
    document.documentElement.style.setProperty('--bg-color', colors.bgColor);
    document.documentElement.style.setProperty('--text-color', colors.textColor);
    document.documentElement.style.setProperty('--scramble-color', colors.scrambleColor);

    // persist colors only
    localStorage.setItem("bgColor", colors.bgColor);
    localStorage.setItem("textColor", colors.textColor);
    localStorage.setItem("scrambleColor", colors.scrambleColor);
  }, [colors.bgColor, colors.textColor, colors.scrambleColor]);

  // color setters
  const setBgColor = (c) => setColors(prev => ({ ...prev, bgColor: c }));
  const setTextColor = (c) => setColors(prev => ({ ...prev, textColor: c }));
  const setScrambleColor = (c) => setColors(prev => ({ ...prev, scrambleColor: c }));

  return {
    bgColor: colors.bgColor,
    textColor: colors.textColor,
    scrambleColor: colors.scrambleColor,
    // expose computed sizes (read-only)
    timerSize: sizes.timer,
    scrambleSize: sizes.scramble,
    cubeSize: sizes.cube,
    isMobile,
    setBgColor,
    setTextColor,
    setScrambleColor,
    // no-op setters for compatibility (don't change sizes)
    setTimerSize: () => {},
    setScrambleSize: () => {},
    setCubeSize: () => {}
  };
}