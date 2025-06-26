import { useState, useEffect } from "react";

export function useTheme() {
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const [bgColor, setBgColor] = useState(localStorage.getItem("bgColor") || "#ffffff");
  const [textColor, setTextColor] = useState(localStorage.getItem("textColor") || "#000000");
  const [scrambleColor, setScrambleColor] = useState(localStorage.getItem("scrambleColor") || "#000000");
  const [timerSize, setTimerSize] = useState(() => parseInt(localStorage.getItem("timerSize")) || 200);
  const [scrambleSize, setScrambleSize] = useState(() => parseInt(localStorage.getItem("scrambleSize")) || 30);
  
  const [cubeSize, setCubeSize] = useState(() => {
    const savedSize = parseInt(localStorage.getItem("cubeSize"));
    return isMobile() ? 10 : (savedSize || 50);
  });

  useEffect(() => {
    if (!isMobile()) {
      localStorage.setItem("cubeSize", cubeSize);
      document.documentElement.style.setProperty('--cube-size', `${cubeSize}px`);
    } else {
      document.documentElement.style.setProperty('--cube-size', '10px');
    }
  }, [cubeSize]);

  useEffect(() => {
    localStorage.setItem("bgColor", bgColor);
    document.documentElement.style.setProperty('--bg-color', bgColor);
  }, [bgColor]);

  useEffect(() => {
    localStorage.setItem("textColor", textColor);
    document.documentElement.style.setProperty('--text-color', textColor);
  }, [textColor]);

  useEffect(() => {
    localStorage.setItem("scrambleColor", scrambleColor);
    document.documentElement.style.setProperty('--scramble-color', scrambleColor);
  }, [scrambleColor]);

  useEffect(() => {
    localStorage.setItem("timerSize", timerSize);
    document.documentElement.style.setProperty('--timer-font-size', `${timerSize}px`);
  }, [timerSize]);

  useEffect(() => {
    localStorage.setItem("scrambleSize", scrambleSize);
    document.documentElement.style.setProperty('--scramble-font-size', `${scrambleSize}px`);
  }, [scrambleSize]);

  return {
    bgColor, setBgColor,
    textColor, setTextColor,
    scrambleColor, setScrambleColor,
    timerSize, setTimerSize,
    scrambleSize, setScrambleSize,
    cubeSize: isMobile() ? 10 : cubeSize, 
    setCubeSize: isMobile() ? () => {} : setCubeSize
  };
}