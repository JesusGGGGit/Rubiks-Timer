import { useState, useEffect } from "react";

export function useTheme() {
  const [bgColor, setBgColor] = useState(localStorage.getItem("bgColor") || "#ffffff");
  const [textColor, setTextColor] = useState(localStorage.getItem("textColor") || "#000000");
  const [scrambleColor, setScrambleColor] = useState(localStorage.getItem("scrambleColor") || "#000000");
  const [timerSize, setTimerSize] = useState(() => parseInt(localStorage.getItem("timerSize")) || 48);
  const [scrambleSize, setScrambleSize] = useState(() => parseInt(localStorage.getItem("scrambleSize")) || 18);

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
    scrambleSize, setScrambleSize
  };
}
