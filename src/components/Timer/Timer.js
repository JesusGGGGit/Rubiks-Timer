import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../App.css";
import confetti from "canvas-confetti";
import SettingsModal from '../Settings/SettingsModal';
import CubeVisualization from '../CubeVisualization/CubeVisualization';
import { parseScramble } from '../../utils/cubeUtils'; 
import { formatTimeDisplay, formatTimeFull } from '../../utils/formatUtils';
import {calculateStats} from '../../utils/calculateStats';



function App() {

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("sessions");
    return saved ? JSON.parse(saved) : [{
      id: 'default',
      name: 'Sesión Principal',
      cubeType: '3x3',
      plusTwoTimes: [],
      dnfTimes: [],
      createdAt: new Date().toISOString()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem("activeSessionId") || 'default';
  });

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const stats = calculateStats(activeSession.times, activeSession.plusTwoTimes, activeSession.dnfTimes);

  const savedBgColor = localStorage.getItem("bgColor") || "#ffffff";
  const savedTextColor = localStorage.getItem("textColor") || "#000000";
  const savedScrambleColor = localStorage.getItem("scrambleColor") || "#000000";
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [inspectionRunning, setInspectionRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [scramble, setScramble] = useState("Generating scramble...");
  const [cubeState, setCubeState] = useState(parseScramble(""));
  const [fullScreenTimer, setFullScreenTimer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bgColor, setBgColor] = useState(savedBgColor);
  const [textColor, setTextColor] = useState(savedTextColor);
  const [scrambleColor, setScrambleColor] = useState(savedScrambleColor);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timeToDeleteIndex, setTimeToDeleteIndex] = useState(null);
  const [dontAskAgain, setDontAskAgain] = useState(() => {
    return localStorage.getItem("dontAskDelete") === "true";
  });
  const [activeSettingsTab, setActiveSettingsTab] = useState("apariencia");
  const [timerSize, setTimerSize] = useState(() => parseInt(localStorage.getItem("timerSize")) || 48);
  const [scrambleSize, setScrambleSize] = useState(() => parseInt(localStorage.getItem("scrambleSize")) || 18);
  const [inspectionTime, setInspectionTime] = useState(() => localStorage.getItem("inspectionTime") === "true");
  const [inspectionDuration, setInspectionDuration] = useState(() => parseInt(localStorage.getItem("inspectionDuration")) || 15);
  const [holdToStart, setHoldToStart] = useState(() => localStorage.getItem("holdToStart") !== "false");
  const [dnf, setDnf] = useState(false);
  const [showDnf, setShowDnf] = useState(false);
  const [showTimeDetailModal, setShowTimeDetailModal] = useState(false);
  const [selectedTimeDetail, setSelectedTimeDetail] = useState(null);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [newSessionCubeType, setNewSessionCubeType] = useState("3x3");
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [sortOrder, setSortOrder] = useState("recent"); // 'recent', 'oldest', 'fastest', 'slowest'

  const openNewSessionForm = () => {
    const today = new Date();
    setNewSessionName(today.toISOString().split('T')[0]);
    setShowNewSessionForm(true);
  };

  const runningRef = useRef(running);
  const inspectionRunningRef = useRef(inspectionRunning);
  const readyRef = useRef(ready);
  const activeSessionRef = useRef(activeSession);
  const timeRef = useRef(time);
  const intervalRef = useRef(null);
  const inspectionIntervalRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  const dnfRef = useRef(dnf);
  const showDnfRef = useRef(showDnf);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { inspectionRunningRef.current = inspectionRunning; }, [inspectionRunning]);
  useEffect(() => { readyRef.current = ready; }, [ready]);
  useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);
  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => { dnfRef.current = dnf; }, [dnf]);
  useEffect(() => { showDnfRef.current = showDnf; }, [showDnf]);

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("activeSessionId", activeSessionId);
  }, [activeSessionId]);

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
    localStorage.setItem("dontAskDelete", dontAskAgain ? "true" : "false");
  }, [dontAskAgain]);

  useEffect(() => {
    localStorage.setItem("timerSize", timerSize);
    document.documentElement.style.setProperty('--timer-font-size', `${timerSize}px`);
  }, [timerSize]);

  useEffect(() => {
    localStorage.setItem("scrambleSize", scrambleSize);
    document.documentElement.style.setProperty('--scramble-font-size', `${scrambleSize}px`);
  }, [scrambleSize]);

  useEffect(() => {
    localStorage.setItem("inspectionTime", inspectionTime);
  }, [inspectionTime]);

  useEffect(() => {
    localStorage.setItem("inspectionDuration", inspectionDuration);
  }, [inspectionDuration]);

  useEffect(() => {
    localStorage.setItem("holdToStart", holdToStart);
  }, [holdToStart]);

  useEffect(() => {
    if (running) {
      setFullScreenTimer(true);
      document.documentElement.requestFullscreen().catch(e => console.log(e));
    } else {
      setFullScreenTimer(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
    }
  }, [running]);

// En la función generateScramble:
const generateScramble = useCallback(async (attempts = 1) => {
  const cubeType = activeSession.cubeType || "333";
  
  // Mostrar mensaje de carga inmediatamente
  setScramble("Generating scramble...");
  setCubeState(parseScramble(""));

  const eventMap = {
    "2x2": "222",
    "3x3": "333",
    "4x4": "444",
    "5x5": "555",
    "6x6": "666",
    "7x7": "777",
    "Pyraminx": "pyram"
  };
  const event = eventMap[cubeType] || "333";

  try {
    if (window.Worker && window.scrambleWorker) {
      const scramble = await new Promise((resolve) => {
        window.scrambleWorker.onmessage = (e) => resolve(e.data);
        window.scrambleWorker.postMessage({ event });
      });
      setScramble(scramble);
      setCubeState(parseScramble(scramble, event));
    } else {
      if (typeof window.randomScrambleForEvent !== "function") {
        throw new Error("Scramble library not ready");
      }
      const scr = await window.randomScrambleForEvent(event);
      setScramble(scr.toString());
      setCubeState(parseScramble(scr.toString(), event));
    }
 } catch (e) {
  console.error("generateScramble error for", event, e);
  setScramble("Error generating scramble");
}

}, [activeSession.cubeType]);

  useEffect(() => {
    if (window.scrambleLibraryLoaded) {
      generateScramble();
    } else {
      const interval = setInterval(() => {
        if (window.scrambleLibraryLoaded) {
          generateScramble();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [generateScramble]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const startInspection = useCallback(() => {
    let remaining = inspectionDuration;
    setTime(-remaining * 1000);
    setDnf(false);
    setShowDnf(false);
    setInspectionRunning(true);

    inspectionIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setTime(-remaining * 1000);

      if (remaining <= 0) {
        clearInterval(inspectionIntervalRef.current);
        setDnf(true);
        setShowDnf(true);
        setInspectionRunning(false);

        setSessions(prevSessions => prevSessions.map(session =>
          session.id === activeSessionId
            ? {
                ...session,
                times: [...session.times, { time: "DNF", scramble: scramble }],
                dnfTimes: [...session.dnfTimes, session.times.length]
              }
            : session
        ));

        generateScramble();
      }
    }, 1000);
  }, [inspectionDuration, activeSessionId, scramble, generateScramble]);

  const handleKeyDown = useCallback((e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (e.code === "Space") {
      e.preventDefault();

      if (showDnfRef.current) {
        setShowDnf(false);
        if (inspectionTime) {
          startInspection();
        }
        return;
      }

      if (!runningRef.current && !inspectionRunningRef.current && !readyRef.current) {
        if (inspectionTime) {
          startInspection();
        } else {
          holdTimeoutRef.current = setTimeout(() => {
            setReady(true);
          }, holdToStart ? 500 : 0);
        }
      }

      if (inspectionRunningRef.current && !readyRef.current) {
        holdTimeoutRef.current = setTimeout(() => {
          if (inspectionRunningRef.current) {
            setReady(true);
          }
        }, 500);
      }
    }
  }, [inspectionTime, holdToStart, startInspection]);

  const handleKeyUp = useCallback((e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (e.code === "Space") {
      e.preventDefault();
      clearTimeout(holdTimeoutRef.current);

      if (showDnfRef.current) return;

      if (readyRef.current) {
        setTime(0);
        setRunning(true);
        setReady(false);
        setInspectionRunning(false);
        clearInterval(inspectionIntervalRef.current);
      }
      else if (inspectionRunningRef.current) {
        // ...
      }
      else if (runningRef.current) {
        setRunning(false);
        if (timeRef.current > 0) {
          setSessions(prevSessions => prevSessions.map(session =>
            session.id === activeSessionId
              ? {
                  ...session,
                  times: [...session.times, { time: timeRef.current, scramble: scramble }],
                  plusTwoTimes: session.plusTwoTimes,
                  dnfTimes: session.dnfTimes
                }
              : session
          ));
        }
        generateScramble();
      }
    }
  }, [activeSessionId, scramble, generateScramble]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearTimeout(holdTimeoutRef.current);
      clearInterval(intervalRef.current);
      clearInterval(inspectionIntervalRef.current);
    };
  }, [handleKeyDown, handleKeyUp]);

  const createNewSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      name: `Sesión ${sessions.length + 1}`,
      times: [],
      plusTwoTimes: [],
      dnfTimes: [],
      createdAt: new Date().toISOString()
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSessionId);
  }, [sessions.length]);

  const switchSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
  }, []);

  const renameSession = useCallback((sessionId, newName) => {
    setSessions(prevSessions => prevSessions.map(session =>
      session.id === sessionId ? {...session, name: newName} : session
    ));
  }, []);

  const deleteSession = useCallback((sessionId) => {
    if (sessions.length <= 1) {
      alert("Debe haber al menos una sesión");
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar esta sesión?`)) {
      setSessions(prevSessions => {
        const newSessions = prevSessions.filter(s => s.id !== sessionId);
        return newSessions;
      });

      if (activeSessionId === sessionId) {
        setActiveSessionId(sessions[0].id);
      }
    }
  }, [activeSessionId, sessions]);

  const resetTimes = useCallback(() => {
    if (window.confirm("¿Estás seguro de que quieres borrar todos los tiempos de esta sesión?")) {
      setSessions(prevSessions => prevSessions.map(session =>
        session.id === activeSessionId
          ? {
              ...session,
              times: [],
              plusTwoTimes: [],
              dnfTimes: []
            }
          : session
      ));
    }
  }, [activeSessionId]);

const handleCreateSession = useCallback(() => {
  if (!newSessionName.trim()) return;

  const newSession = {
    id: Date.now().toString(),
    name: newSessionName,
    cubeType: newSessionCubeType,
    times: [],
    plusTwoTimes: [],
    dnfTimes: [],
    createdAt: new Date().toISOString()
  };

  setSessions(prev => [...prev, newSession]);
  setActiveSessionId(newSession.id);
  setShowNewSessionForm(false);
  setNewSessionName("");
  setNewSessionCubeType("3x3");
}, [newSessionName, newSessionCubeType]);

  const deleteTime = useCallback((index) => {
    setSessions(prevSessions => prevSessions.map(session =>
      session.id === activeSessionId
        ? {
            ...session,
            times: session.times.filter((_, i) => i !== index),
            plusTwoTimes: session.plusTwoTimes
              .filter(i => i !== index)
              .map(i => i > index ? i - 1 : i),
            dnfTimes: session.dnfTimes
              .filter(i => i !== index)
              .map(i => i > index ? i - 1 : i)
          }
        : session
    ));
  }, [activeSessionId]);

  const requestDeleteTime = useCallback((index) => {
    if (dontAskAgain) {
      deleteTime(index);
    } else {
      setTimeToDeleteIndex(index);
      setShowDeleteModal(true);
    }
  }, [dontAskAgain, deleteTime]);

  const confirmDeleteTime = useCallback(() => {
    if (timeToDeleteIndex !== null) {
      deleteTime(timeToDeleteIndex);
    }
    setShowDeleteModal(false);
  }, [timeToDeleteIndex, deleteTime]);

  const handleOutsideClick = useCallback((e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setShowDeleteModal(false);
      setShowTimeDetailModal(false);
      setShowNewSessionForm(false);
      setShowStatsModal(false);
    }
  }, []);

  const openTimeDetailModal = useCallback((index) => {
    setSelectedTimeDetail({
      index: index,
      time: activeSession.times[index].time,
      scramble: activeSession.times[index].scramble
    });
    setShowTimeDetailModal(true);
  }, [activeSession.times]);

  const openStatDetail = useCallback((statKey) => {
    setSelectedStat(statKey);
    setShowStatsModal(true);
  }, []);

  const applyPlusTwo = useCallback(() => {
    if (selectedTimeDetail) {
      setSessions(prevSessions => prevSessions.map(session =>
        session.id === activeSessionId
          ? {
              ...session,
              plusTwoTimes: session.plusTwoTimes.includes(selectedTimeDetail.index)
                ? session.plusTwoTimes.filter(i => i !== selectedTimeDetail.index)
                : [...session.plusTwoTimes, selectedTimeDetail.index],
              dnfTimes: session.dnfTimes.filter(i => i !== selectedTimeDetail.index)
            }
          : session
      ));
    }
  }, [activeSessionId, selectedTimeDetail]);

  const applyDnf = useCallback(() => {
    if (selectedTimeDetail) {
      setSessions(prevSessions => prevSessions.map(session =>
        session.id === activeSessionId
          ? {
              ...session,
              dnfTimes: session.dnfTimes.includes(selectedTimeDetail.index)
                ? session.dnfTimes.filter(i => i !== selectedTimeDetail.index)
                : [...session.dnfTimes, selectedTimeDetail.index],
              plusTwoTimes: session.plusTwoTimes.filter(i => i !== selectedTimeDetail.index)
            }
          : session
      ));
    }
  }, [activeSessionId, selectedTimeDetail]);

  const fireConfetti = useCallback(() => {
    const duration = 1 * 1000;
    const end = Date.now() + duration;

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const shapes = ['square', 'circle', 'line', 'star'];

    (function frame() {
      confetti({
        particleCount: 8 + Math.floor(Math.random() * 12),
        startVelocity: 30 + Math.random() * 20,
        angle: Math.random() * 360,
        spread: 80 + Math.random() * 20,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.5
        },
        colors,
        shapes,
        ticks: 200 + Math.floor(Math.random() * 100)
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

const prevBestTimeRef = useRef(null);
useEffect(() => {
  prevBestTimeRef.current = null;
}, [activeSessionId]);

useEffect(() => {
  if (activeSession.times.length === 0) {
    prevBestTimeRef.current = null;
    return;
  }

  const currentBest = stats.bestTime;
  
  if (currentBest !== null && prevBestTimeRef.current !== null && currentBest < prevBestTimeRef.current) {
    fireConfetti();
  }
  
  prevBestTimeRef.current = currentBest;
}, [activeSession.times, stats.bestTime, fireConfetti]);




  const getSortedTimes = () => {
    const timesWithIndices = activeSession.times.map((t, i) => ({
      ...t,
      index: i,
      isDnf: activeSession.dnfTimes.includes(i),
      isPlusTwo: activeSession.plusTwoTimes.includes(i),
      numericTime: activeSession.dnfTimes.includes(i) ? Infinity : 
                 (activeSession.plusTwoTimes.includes(i) ? t.time + 2000 : t.time)
    }));

    switch (sortOrder) {
      case 'recent':
        return [...timesWithIndices].reverse();
      case 'oldest':
        return [...timesWithIndices];
      case 'fastest':
        return [...timesWithIndices].sort((a, b) => a.numericTime - b.numericTime);
      case 'slowest':
        return [...timesWithIndices].sort((a, b) => b.numericTime - a.numericTime);
      default:
        return [...timesWithIndices].reverse();
    }
  };

const getStdDevDescription = (cv) => {
  if (cv === null || isNaN(cv)) return "No hay datos suficientes para calcular la variación de tus tiempos.";
  if (cv <= 5) return "Muy baja variación: tus tiempos son muy estables y casi no cambian.";
  if (cv <= 10) return "Baja variación: tus tiempos son bastante similares entre sí.";
  if (cv <= 15) return "Variación moderada: tus tiempos suelen ser bastante regulares.";
  if (cv <= 20) return "Variación aceptable: hay algo de diferencia entre tus tiempos, pero es normal.";
  if (cv <= 25) return "Variación notable: tus tiempos cambian con cierta frecuencia.";
  if (cv <= 30) return "Alta variación: tus tiempos son irregulares y cambian bastante.";
  if (cv <= 40) return "Muy alta variación: tus tiempos fluctúan mucho y son impredecibles.";
  return "Extrema variación: tus tiempos son muy inconsistentes y muy variables.";
};

const getStdDevColor = (cv) => {
  if (cv === null || isNaN(cv)) return "inherit";
  if (cv <= 5) return "#00FF00";       // Verde fuerte - excelente
  if (cv <= 10) return "#7FFF00";      // Verde lima - muy buena
  if (cv <= 15) return "#ADFF2F";      // Verde amarillento - buena
  if (cv <= 20) return "#FFFF00";      // Amarillo - regular
  if (cv <= 25) return "#FFA500";      // Naranja claro - moderada
  if (cv <= 30) return "#FF8C00";      // Naranja oscuro - baja
  if (cv <= 40) return "#FF4500";      // Rojo anaranjado - muy baja
  return "#DC143C";                    // Carmesí - pésima
};


  const renderStatDetail = () => {
    if (!selectedStat) return null;
    
    const statInfo = {
      bestTime: {
        title: "Mejor Tiempo",
        description: "El tiempo más rápido que has conseguido en esta sesión.",
        value: formatTimeFull(stats.bestTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes),
        times: stats.validTimes.filter(t => !t.isDNF && (t.isPlusTwo ? t.time + 2000 : t.time) === stats.bestTime)
      },
      worstTime: {
        title: "Peor Tiempo",
        description: "El tiempo más lento que has conseguido en esta sesión (sin contar DNFs).",
        value: formatTimeFull(stats.worstTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes),
        times: stats.validTimes.filter(t => !t.isDNF && (t.isPlusTwo ? t.time + 2000 : t.time) === stats.worstTime)
      },
      ao5: {
        title: "Promedio de 5 (Ao5)",
        description: "El promedio de tus últimos 5 tiempos (excluyendo el mejor y el peor).",
        value: stats.ao5 !== null ? formatTimeFull(stats.ao5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
        times: activeSession.times.slice(-5)
      },
      ao12: {
        title: "Promedio de 12 (Ao12)",
        description: "El promedio de tus últimos 12 tiempos (excluyendo el mejor y el peor).",
        value: stats.ao12 !== null ? formatTimeFull(stats.ao12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
        times: activeSession.times.slice(-12)
      },
      ao50: {
        title: "Promedio de 50 (Ao50)",
        description: "El promedio de tus últimos 50 tiempos (excluyendo el mejor y el peor).",
        value: stats.ao50 !== null ? formatTimeFull(stats.ao50, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
        times: activeSession.times.slice(-50)
      },
      ao100: {
        title: "Promedio de 100 (Ao100)",
        description: "El promedio de tus últimos 100 tiempos (excluyendo el mejor y el peor).",
        value: stats.ao100 !== null ? formatTimeFull(stats.ao100, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
        times: activeSession.times.slice(-100)
      },
      mo3: {
        title: "Media de 3 (Mo3)",
        description: "La media aritmética de tus últimos 3 tiempos (sin excluir ninguno).",
        value: stats.mo3 !== null ? formatTimeFull(stats.mo3, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
        times: activeSession.times.slice(-3)
      },
      bestAo5: {
        title: "Mejor Ao5",
        description: "El mejor promedio de 5 tiempos consecutivos que has conseguido.",
        value: stats.bestAo5 !== null ? formatTimeFull(stats.bestAo5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
        times: []
      },
      worstAo5: {
        title: "Peor Ao5",
        description: "El peor promedio de 5 tiempos consecutivos que has conseguido.",
        value: stats.worstAo5 !== null ? formatTimeFull(stats.worstAo5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
        times: []
      },
      bestAo12: {
        title: "Mejor Ao12",
        description: "El mejor promedio de 12 tiempos consecutivos que has conseguido.",
        value: stats.bestAo12 !== null ? formatTimeFull(stats.bestAo12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
        times: []
      },
      worstAo12: {
        title: "Peor Ao12",
        description: "El peor promedio de 12 tiempos consecutivos que has conseguido.",
        value: stats.worstAo12 !== null ? formatTimeFull(stats.worstAo12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
        times: []
      },
    stdDev: {
  title: "Coeficiente de Variación",
  description: (stats.stdDev !== null && stats.overallAverage > 0) 
    ? getStdDevDescription((stats.stdDev / stats.overallAverage) * 100)
    : "No hay datos suficientes para calcular la consistencia.",
value: stats.stdDev !== null && stats.overallAverage > 0
  ? (
    <span style={{ color: getStdDevColor((stats.stdDev / stats.overallAverage) * 100) }}>
      {(stats.stdDev / stats.overallAverage * 100).toFixed(1)}%
    </span>
  )
  : "--",

  times: []
},

      successRate: {
        title: "Tasa de Éxito",
        description: "Porcentaje de solves completados sin DNFs.",
        value: `${stats.successRate}%`,
        times: []
      }
    };

    const currentStat = statInfo[selectedStat];
    if (!currentStat) return null;

    return (
      <div className="stat-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stat-detail-content">
          <div className="stat-detail-header">
            <h3>{currentStat.title}</h3>
            <div className="stat-detail-value">{currentStat.value}</div>
          </div>
          
          <div className="stat-detail-description">
            <p>{currentStat.description}</p>
          </div>

          {currentStat.times.length > 0 && (
            <div className="stat-times-list">
              <h4>Tiempos incluidos:</h4>
              {currentStat.times.map((t, i) => (
                <div 
                  key={i} 
                  className="stat-time-entry"
                  onClick={() => {
                    setShowStatsModal(false);
                    openTimeDetailModal(t.index !== undefined ? t.index : activeSession.times.length - currentStat.times.length + i);
                  }}
                >
                  <div className="stat-time-info">
                    <span className="stat-time-index">
                      {t.index !== undefined ? t.index + 1 : activeSession.times.length - currentStat.times.length + i + 1}.
                    </span>
                    <span className="stat-time-value">
                      {formatTimeFull(t.time, t.index !== undefined ? t.index : activeSession.times.length - currentStat.times.length + i, activeSession.plusTwoTimes, activeSession.dnfTimes)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="stat-detail-actions">
            <button 
              className="stat-detail-btn" 
              onClick={() => setShowStatsModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`app-container ${fullScreenTimer ? "full-screen-mode" : ""}`} style={{ backgroundColor: bgColor }}>
      
      {!fullScreenTimer && (
       <aside className="times-sidebar">
  <div className="sidebar-header">
    <h2>Historial de Tiempos</h2>
  </div>
          <div className="stats-summary">
            <div className="stat-card" onClick={() => openStatDetail("bestTime")}>
              <div className="stat-label">Mejor</div>
              <div className="stat-value">{stats.bestTime !== null ? formatTimeFull(stats.bestTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}</div>
            </div>
            <div className="stat-card" onClick={() => openStatDetail("worstTime")}>
              <div className="stat-label">Peor</div>
              <div className="stat-value">{stats.worstTime !== null ? formatTimeFull(stats.worstTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}</div>
            </div>
            <div className="stat-card" onClick={() => openStatDetail("ao5")}>
              <div className="stat-label">Ao5</div>
              <div className="stat-value">{stats.ao5 !== null ? formatTimeFull(stats.ao5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}</div>
            </div>
            <div className="stat-card" onClick={() => openStatDetail("ao12")}>
              <div className="stat-label">Ao12</div>
              <div className="stat-value">{stats.ao12 !== null ? formatTimeFull(stats.ao12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}</div>
            </div>
            <div className="stat-card" onClick={() => openStatDetail("mo3")}>
              <div className="stat-label">Mo3</div>
              <div className="stat-value">{stats.mo3 !== null ? formatTimeFull(stats.mo3, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}</div>
            </div>
<div className="stat-card" onClick={() => openStatDetail("stdDev")}>
  <div className="stat-label">Variación</div>
  <div
    className="stat-value"
    style={{
      color:
        stats.stdDev !== null && stats.overallAverage > 0
          ? getStdDevColor((stats.stdDev / stats.overallAverage) * 100)
          : "inherit"
    }}
  >
    {stats.stdDev !== null && stats.overallAverage > 0
      ? `${((stats.stdDev / stats.overallAverage) * 100).toFixed(1)}%`
      : "-:-"}
  </div>
</div>


          </div>
          
          <div className="sessions-menu">
                <div className="sort-select-wrapper">

                            <select
                value={activeSessionId}
                onChange={(e) => switchSession(e.target.value)}
                className="session-selector"
              >
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {`${session.name}(${session.cubeType || '3x3'})•${session.times.length}`}
                  </option>
                ))}
              </select>
                      </div>
            <button
              className="new-session-btn"
              onClick={openNewSessionForm}
              title="Crear nueva sesión"
            >
              +
            </button>
          </div>
  <div className="sort-container">
    <span className="sort-label">Ordenar por:</span>
    <div className="sort-select-wrapper">
      <select 
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="sort-select"
      >
        <option value="recent">Más recientes</option>
        <option value="oldest">Más antiguos</option>
        <option value="fastest">Mejores tiempos</option>
        <option value="slowest">Peores tiempos</option>
      </select>
    </div>
  </div>
          {showNewSessionForm && (
            <div className="modal-overlay" onClick={handleOutsideClick}>
              <div className="time-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="time-detail-content">
                  <div className="time-detail-header">
                    <h3>Crear nueva sesión</h3>
                  </div>

                  <div className="time-detail-info">
                    <div className="time-detail-item">
                      <label className="time-detail-label">Nombre:</label>
                      <input
                        type="text"
                        className="time-detail-input"
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                      />

                    <select
                      className="time-detail-select"
                      value={newSessionCubeType}
                      onChange={(e) => setNewSessionCubeType(e.target.value)}
                    >
                      <option value="2x2">2x2</option>
                      <option value="3x3">3x3</option>
                      <option value="4x4">4x4</option>
                      <option value="5x5">5x5</option>
                      <option value="6x6">6x6</option>
                      <option value="7x7">7x7</option>
                      <option value="Pyraminx">Pyraminx</option>
                    </select>
                    </div>
                  </div>

                  <div className="time-detail-actions">
                    <button className="time-detail-btn" onClick={handleCreateSession}>
                      Crear
                    </button>
                    <button
                      className="time-detail-btn secondary"
                      onClick={() => setShowNewSessionForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="times-list">
            {activeSession.times.length === 0 ? (
              <div className="empty-state">
                <p>No hay tiempos registrados aún</p>
              </div>
            ) : (
              getSortedTimes().map((t, i) => (
                <div key={t.index} className={`time-entry ${stats.numericTimes[t.index] === stats.bestTime ? "best-time" : ""}`} onClick={() => openTimeDetailModal(t.index)}>
                  <div className="time-info">
                    <span className="time-index">{t.index + 1}.</span>
                    <span className="time-value">{formatTimeFull(t.time, t.index, activeSession.plusTwoTimes, activeSession.dnfTimes)}</span>
                    {stats.numericTimes[t.index] === stats.bestTime && <span className="best-badge">★</span>}
                  </div>
                  <button className="delete-btn" onClick={(e) => { e.stopPropagation(); requestDeleteTime(t.index); }} aria-label="Borrar tiempo">
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      )}
      
      <main className={`main-content ${fullScreenTimer ? "full-screen" : ""}`}>
        {!fullScreenTimer && (
          <>
            <button className="settings-button" onClick={() => setShowSettings(true)}>
              ⚙️
            </button>
            <div className="scramble-display">
              <div className="scramble-label" style={{ color: scrambleColor }}>
                Scramble
              </div>
              <div className="scramble-text" style={{ color: scrambleColor }}>
                {scramble}
              </div>
            </div>
          </>
        )}
        
        <div className={`timer-container ${fullScreenTimer ? "full-screen" : ""}`}>
          {showDnf ? (
            <div className={`dnf-mode ${inspectionRunning ? "inspecting" : ""}`} style={{ color: textColor }}>
              <span className="dnf-text">DNF</span>
            </div>
          ) : (
            <div className={`timer-display ${inspectionRunning ? "inspecting" : ""} ${ready ? "ready" : ""}`}
                 style={{ color: textColor }}>
              {formatTimeDisplay(time)}
            </div>
          )}
        </div>

        {!fullScreenTimer && (
          <div className="instructions">
            <p>
              {inspectionTime
                ? "Presiona espacio para inspección • Mantén para iniciar • Suelta para detener"
                : holdToStart
                ? "Mantén espacio para preparar • Suelta para iniciar • Presiona nuevamente para detener"
                : "Presiona espacio para iniciar/detener"}
            </p>
          </div>
        )}

        {!fullScreenTimer && (
          <div className="cube-container" style={{ 
            backgroundColor: bgColor, 
            padding: '10px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 10 
          }}>
<CubeVisualization 
  cubeState={cubeState} 
  cubeType={activeSession.cubeType || '3x3'} 
/>          </div>
        )}
      </main>

      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        activeSettingsTab={activeSettingsTab}
        setActiveSettingsTab={setActiveSettingsTab}
        bgColor={bgColor}
        setBgColor={setBgColor}
        textColor={textColor}
        setTextColor={setTextColor}
        scrambleColor={scrambleColor}
        setScrambleColor={setScrambleColor}
        timerSize={timerSize}
        setTimerSize={setTimerSize}
        holdToStart={holdToStart}
        setHoldToStart={setHoldToStart}
        inspectionTime={inspectionTime}
        setInspectionTime={setInspectionTime}
        inspectionDuration={inspectionDuration}
        setInspectionDuration={setInspectionDuration}
        dontAskAgain={dontAskAgain}
        setDontAskAgain={setDontAskAgain}
        resetTimes={resetTimes}
        sessions={sessions}
        renameSession={renameSession}
        deleteSession={deleteSession}
        activeSessionId={activeSessionId}
        createNewSession={createNewSession}
        scrambleSize={scrambleSize}
        setScrambleSize={setScrambleSize}
      />
      
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleOutsideClick}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>¿Estás seguro de que quieres borrar este tiempo?</p>
            <div className="modal-checkbox">
              <label className="centered-label">
                <input type="checkbox" checked={dontAskAgain} onChange={(e) => setDontAskAgain(e.target.checked)} />
                No preguntar de nuevo
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button className="delete-button" onClick={confirmDeleteTime}>
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showTimeDetailModal && selectedTimeDetail && (
        <div className="modal-overlay" onClick={handleOutsideClick}>
          <div className="time-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="time-detail-content">
              <div className="time-detail-header">
                <h3>Detalle del Tiempo #{selectedTimeDetail.index + 1}</h3>
              </div>

              <div className="time-detail-info">
                <div className="time-detail-item">
                  <div className="time-detail-label">Tiempo</div>
                  <div className="time-detail-value">
                    {formatTimeFull(selectedTimeDetail.time, selectedTimeDetail.index, activeSession.plusTwoTimes, activeSession.dnfTimes)}
                  </div>
                </div>

                <div className="time-detail-item">
                  <div className="time-detail-label">Scramble</div>
                  <div className="time-detail-value">{selectedTimeDetail.scramble}</div>
                  <CubeVisualization cubeState={parseScramble(selectedTimeDetail.scramble)} />
                </div>
              </div>

              <div className="time-detail-actions">
                <button
                  className="time-detail-btn secondary"
                  onClick={() => setShowTimeDetailModal(false)}
                >
                  Cerrar
                </button>

                <button
                  className={`time-detail-btn ${activeSession.plusTwoTimes.includes(selectedTimeDetail.index) ? 'active' : 'primary'}`}
                  onClick={applyPlusTwo}
                  disabled={activeSession.dnfTimes.includes(selectedTimeDetail.index)}
                >
                  {activeSession.plusTwoTimes.includes(selectedTimeDetail.index) ? 'Quitar +2' : 'Aplicar +2'}
                </button>

                <button
                  className={`time-detail-btn ${activeSession.dnfTimes.includes(selectedTimeDetail.index) ? 'danger-active' : 'danger'}`}
                  onClick={applyDnf}
                >
                  {activeSession.dnfTimes.includes(selectedTimeDetail.index) ? 'Quitar DNF' : 'Marcar DNF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStatsModal && (
        <div className="modal-overlay" onClick={handleOutsideClick}>
          {renderStatDetail()}
        </div>
      )}
    </div>
  );
}

export default App;