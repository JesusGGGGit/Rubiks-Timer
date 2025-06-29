import { useState, useEffect } from "react";

export function useTheme() {
  // Detección de móvil solo una vez al montar
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Estado inicial con valores por defecto
  const [theme, setTheme] = useState(() => ({
    bgColor: localStorage.getItem("bgColor") || "#ffffff",
    textColor: localStorage.getItem("textColor") || "#000000",
    scrambleColor: localStorage.getItem("scrambleColor") || "#000000",
    timerSize: parseInt(localStorage.getItem("timerSize")) || 200,
    scrambleSize: parseInt(localStorage.getItem("scrambleSize")) || 30,
    cubeSize: Math.min(
      parseInt(localStorage.getItem("cubeSize")) || 50,
      isMobile ? 10 : 20 // Límites diferentes para móvil/desktop
    )
  }));

  // Actualizar CSS y localStorage cuando cambia el tema
  useEffect(() => {
    // Colores
    document.documentElement.style.setProperty('--bg-color', theme.bgColor);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    document.documentElement.style.setProperty('--scramble-color', theme.scrambleColor);
    
    // Tamaños
    document.documentElement.style.setProperty('--timer-font-size', `${theme.timerSize}px`);
    document.documentElement.style.setProperty('--scramble-font-size', `${theme.scrambleSize}px`);
    document.documentElement.style.setProperty('--cube-size', `${isMobile ? 20 : theme.cubeSize}px`);
    
    // Guardar en localStorage (excepto cubeSize en móviles)
    localStorage.setItem("bgColor", theme.bgColor);
    localStorage.setItem("textColor", theme.textColor);
    localStorage.setItem("scrambleColor", theme.scrambleColor);
    localStorage.setItem("timerSize", theme.timerSize);
    localStorage.setItem("scrambleSize", theme.scrambleSize);
    if (!isMobile) localStorage.setItem("cubeSize", theme.cubeSize);
  }, [theme, isMobile]);

  // Setters específicos
  const updateTheme = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  return {
    bgColor: theme.bgColor,
    textColor: theme.textColor,
    scrambleColor: theme.scrambleColor,
    timerSize: theme.timerSize,
    scrambleSize: theme.scrambleSize,
    cubeSize: isMobile ? 10 : theme.cubeSize,
    isMobile,
    setBgColor: (color) => updateTheme('bgColor', color),
    setTextColor: (color) => updateTheme('textColor', color),
    setScrambleColor: (color) => updateTheme('scrambleColor', color),
    setTimerSize: (size) => updateTheme('timerSize', size),
    setScrambleSize: (size) => updateTheme('scrambleSize', size),
    setCubeSize: isMobile ? null : (size) => updateTheme('cubeSize', size)
  };
}