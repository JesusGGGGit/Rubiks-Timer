import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import confetti from "canvas-confetti";

function formatTimeDisplay(ms) {
  if (ms >= 0) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    const twoDigits = (n) => (n < 10 ? "0" + n : n);
   
    if (hours > 0) return `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}.${tenths}`;
    if (minutes > 0) return `${minutes}:${twoDigits(seconds)}.${tenths}`;
    return `${seconds}.${tenths}`;
  } else {
    const seconds = Math.ceil(Math.abs(ms) / 1000);
    return `${seconds}`;
  }
}

function formatTimeFull(ms, index, plusTwoTimes, dnfTimes) {
  const isPlusTwo = plusTwoTimes.includes(index);
  const isDnf = dnfTimes.includes(index);
  
  if (isDnf) return "DNF";
  
  const displayMs = isPlusTwo && typeof ms === 'number' ? ms + 2000 : ms;
  
  if (displayMs === "DNF") return "DNF";
  
  const hours = Math.floor(displayMs / 3600000);
  const minutes = Math.floor((displayMs % 3600000) / 60000);
  const seconds = Math.floor((displayMs % 60000) / 1000);
  const centiseconds = Math.floor((displayMs % 1000) / 10);
  const twoDigits = (n) => (n < 10 ? "0" + n : n);
  
  let timeStr;
  if (hours > 0) {
    timeStr = `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}.${twoDigits(centiseconds)}`;
  } else if (minutes > 0) {
    timeStr = `${minutes}:${twoDigits(seconds)}.${twoDigits(centiseconds)}`;
  } else {
    timeStr = `${seconds}.${twoDigits(centiseconds)}`;
  }
  
  return isPlusTwo ? `${timeStr} (+2)` : timeStr;
}

function parseScramble(scramble) {
  const cubeState = {
    U: Array(9).fill('white'),
    L: Array(9).fill('orange'),
    F: Array(9).fill('green'),
    R: Array(9).fill('red'),
    B: Array(9).fill('blue'),
    D: Array(9).fill('yellow')
  };

  if (!scramble || typeof scramble !== 'string' || scramble.includes("Generating") || scramble.includes("Failed")) {
    return cubeState;
  }

  const moves = scramble.split(' ');

  moves.forEach(move => {
    if (!move) return;
    const face = move[0];
    const isPrime = move.includes("'");
    const isDouble = move.includes("2");
    const turns = isDouble ? 2 : (isPrime ? 3 : 1);
    for (let i = 0; i < turns; i++) {
      rotateFace(cubeState, face);
    }
  });

  return cubeState;
}

function rotateFace(cubeState, face) {
  const fc = cubeState[face];
  cubeState[face] = [
    fc[6], fc[3], fc[0],
    fc[7], fc[4], fc[1],
    fc[8], fc[5], fc[2]
  ];

  let temp;
  switch (face) {
    case 'U': {
      temp = cubeState.F.slice(0, 3);
      cubeState.F[0] = cubeState.R[0];
      cubeState.F[1] = cubeState.R[1];
      cubeState.F[2] = cubeState.R[2];

      cubeState.R[0] = cubeState.B[0];
      cubeState.R[1] = cubeState.B[1];
      cubeState.R[2] = cubeState.B[2];

      cubeState.B[0] = cubeState.L[0];
      cubeState.B[1] = cubeState.L[1];
      cubeState.B[2] = cubeState.L[2];

      cubeState.L[0] = temp[0];
      cubeState.L[1] = temp[1];
      cubeState.L[2] = temp[2];
      break;
    }

    case 'D': {
      temp = cubeState.F.slice(6, 9);
      cubeState.F[6] = cubeState.L[6];
      cubeState.F[7] = cubeState.L[7];
      cubeState.F[8] = cubeState.L[8];

      cubeState.L[6] = cubeState.B[6];
      cubeState.L[7] = cubeState.B[7];
      cubeState.L[8] = cubeState.B[8];

      cubeState.B[6] = cubeState.R[6];
      cubeState.B[7] = cubeState.R[7];
      cubeState.B[8] = cubeState.R[8];

      cubeState.R[6] = temp[0];
      cubeState.R[7] = temp[1];
      cubeState.R[8] = temp[2];
      break;
    }

    case 'F': {
      temp = [cubeState.U[6], cubeState.U[7], cubeState.U[8]];
      cubeState.U[6] = cubeState.L[8];
      cubeState.U[7] = cubeState.L[5];
      cubeState.U[8] = cubeState.L[2];

      cubeState.L[8] = cubeState.D[2];
      cubeState.L[5] = cubeState.D[1];
      cubeState.L[2] = cubeState.D[0];

      cubeState.D[0] = cubeState.R[6];
      cubeState.D[1] = cubeState.R[3];
      cubeState.D[2] = cubeState.R[0];

      cubeState.R[0] = temp[0];
      cubeState.R[3] = temp[1];
      cubeState.R[6] = temp[2];
      break;
    }

    case 'B': {
      temp = [cubeState.U[0], cubeState.U[1], cubeState.U[2]];
      cubeState.U[0] = cubeState.R[2];
      cubeState.U[1] = cubeState.R[5];
      cubeState.U[2] = cubeState.R[8];

      cubeState.R[2] = cubeState.D[8];
      cubeState.R[5] = cubeState.D[7];
      cubeState.R[8] = cubeState.D[6];

      cubeState.D[6] = cubeState.L[0];
      cubeState.D[7] = cubeState.L[3];
      cubeState.D[8] = cubeState.L[6];

      cubeState.L[0] = temp[2];
      cubeState.L[3] = temp[1];
      cubeState.L[6] = temp[0];
      break;
    }

    case 'R': {
      temp = [cubeState.U[2], cubeState.U[5], cubeState.U[8]];
      cubeState.U[2] = cubeState.F[2];
      cubeState.U[5] = cubeState.F[5];
      cubeState.U[8] = cubeState.F[8];

      cubeState.F[2] = cubeState.D[2];
      cubeState.F[5] = cubeState.D[5];
      cubeState.F[8] = cubeState.D[8];

      cubeState.D[2] = cubeState.B[6];
      cubeState.D[5] = cubeState.B[3];
      cubeState.D[8] = cubeState.B[0];

      cubeState.B[0] = temp[2];
      cubeState.B[3] = temp[1];
      cubeState.B[6] = temp[0];
      break;
    }

    case 'L': {
      temp = [cubeState.U[0], cubeState.U[3], cubeState.U[6]];
      cubeState.U[0] = cubeState.B[8];
      cubeState.U[3] = cubeState.B[5];
      cubeState.U[6] = cubeState.B[2];

      cubeState.B[2] = cubeState.D[6];
      cubeState.B[5] = cubeState.D[3];
      cubeState.B[8] = cubeState.D[0];

      cubeState.D[0] = cubeState.F[0];
      cubeState.D[3] = cubeState.F[3];
      cubeState.D[6] = cubeState.F[6];

      cubeState.F[0] = temp[0];
      cubeState.F[3] = temp[1];
      cubeState.F[6] = temp[2];
      break;
    }
  }
}

function CubeVisualization({ cubeState }) {
  return (
    <div className="cube-visualization">
      <div className="cube-face-row">
        <div className="cube-face placeholder"></div>
        <div className="cube-face up-face">
          {cubeState.U.map((color, i) => (
            <div key={`U${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face placeholder"></div>
        <div className="cube-face placeholder"></div>
      </div>
      <div className="cube-face-row">
        <div className="cube-face left-face">
          {cubeState.L.map((color, i) => (
            <div key={`L${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face front-face">
          {cubeState.F.map((color, i) => (
            <div key={`F${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face right-face">
          {cubeState.R.map((color, i) => (
            <div key={`R${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face back-face">
          {cubeState.B.map((color, i) => (
            <div key={`B${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
      </div>
      <div className="cube-face-row">
        <div className="cube-face placeholder"></div>
        <div className="cube-face down-face">
          {cubeState.D.map((color, i) => (
            <div key={`D${i}`} className="cube-sticker" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <div className="cube-face placeholder"></div>
        <div className="cube-face placeholder"></div>
      </div>
    </div>
  );
}

function App() {
  // Estados para sesiones
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("sessions");
    return saved ? JSON.parse(saved) : [{
      id: 'default',
      name: 'Sesión Principal',
      times: [],
      plusTwoTimes: [],
      dnfTimes: [],
      createdAt: new Date().toISOString()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem("activeSessionId") || 'default';
  });

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Otros estados
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
  const [previousBestTime, setPreviousBestTime] = useState(null);

  // Variables derivadas
  const numericTimes = activeSession.times.map((t, i) => {
    if (activeSession.dnfTimes.includes(i)) return null;
    if (t.time === "DNF") return null;
    return activeSession.plusTwoTimes.includes(i) ? t.time + 2000 : t.time;
  }).filter(t => t !== null);

  const bestTime = numericTimes.length > 0 ? Math.min(...numericTimes) : null;

  const average = (arr) => {
    const nums = arr.map((t, i) => {
      if (activeSession.dnfTimes.includes(i)) return null;
      if (t.time === "DNF") return null;
      return activeSession.plusTwoTimes.includes(i) ? t.time + 2000 : t.time;
    }).filter(t => t !== null);
   
    return nums.length === 0 ? null : nums.reduce((a, b) => a + b, 0) / nums.length;
  };
 
  const ao5 = activeSession.times.length >= 5 ? average(activeSession.times.slice(-5)) : null;
  const ao12 = activeSession.times.length >= 12 ? average(activeSession.times.slice(-12)) : null;

  // Refs
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
  const confettiRef = useRef(null);

  // Efectos para sincronizar refs
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { inspectionRunningRef.current = inspectionRunning; }, [inspectionRunning]);
  useEffect(() => { readyRef.current = ready; }, [ready]);
  useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);
  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => { dnfRef.current = dnf; }, [dnf]);
  useEffect(() => { showDnfRef.current = showDnf; }, [showDnf]);

  // Efectos para persistencia en localStorage
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

  // Función para generar scramble
  const generateScramble = async (attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      try {
        if (typeof window.randomScrambleForEvent !== "function") throw new Error("Scramble library not ready");
        const scr = await window.randomScrambleForEvent("333");
        setScramble(scr.toString());
        setCubeState(parseScramble(scr.toString()));
        return;
      } catch (e) {
        if (i === attempts - 1) {
          setScramble("Failed to generate scramble after multiple attempts");
        } else {
          await new Promise(res => setTimeout(res, 500));
        }
      }
    }
  };

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
  }, []);

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

  // Función para iniciar inspección
  const startInspection = () => {
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
       
        const newSessions = sessions.map(session => 
          session.id === activeSessionId 
            ? {
                ...session,
                times: [...session.times, { time: "DNF", scramble: scramble }],
                dnfTimes: [...session.dnfTimes, session.times.length]
              }
            : session
        );
        setSessions(newSessions);
       
        generateScramble();
      }
    }, 1000);
  };

  // Manejadores de eventos del teclado
  const handleKeyDown = (e) => {
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
  };

  const handleKeyUp = (e) => {
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
      }
      else if (runningRef.current) {
        setRunning(false);
        if (timeRef.current > 0) {
          const newSessions = sessions.map(session => 
            session.id === activeSessionId 
              ? {
                  ...session,
                  times: [...session.times, { time: timeRef.current, scramble: scramble }]
                }
              : session
          );
          setSessions(newSessions);
        }
        generateScramble();
      }
    }
  };

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
  }, [inspectionTime, holdToStart, inspectionDuration, scramble, activeSessionId]);

  // Funciones para manejar sesiones
  const createNewSession = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      name: `Sesión ${sessions.length + 1}`,
      times: [],
      plusTwoTimes: [],
      dnfTimes: [],
      createdAt: new Date().toISOString()
    };
    
    setSessions([...sessions, newSession]);
    setActiveSessionId(newSessionId);
  };

  const switchSession = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  const renameSession = (sessionId, newName) => {
    setSessions(sessions.map(session => 
      session.id === sessionId ? {...session, name: newName} : session
    ));
  };

  const deleteSession = (sessionId) => {
    if (sessions.length <= 1) {
      alert("Debe haber al menos una sesión");
      return;
    }
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar esta sesión?`)) {
      const newSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(newSessions);
      
      if (activeSessionId === sessionId) {
        setActiveSessionId(newSessions[0].id);
      }
    }
  };

  // Funciones para manejar tiempos
  const resetTimes = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar todos los tiempos de esta sesión?")) {
      const newSessions = sessions.map(session => 
        session.id === activeSessionId 
          ? {
              ...session,
              times: [],
              plusTwoTimes: [],
              dnfTimes: []
            }
          : session
      );
      setSessions(newSessions);
    }
  };

  const deleteTime = (index) => {
    const newSessions = sessions.map(session => 
      session.id === activeSessionId 
        ? {
            ...session,
            times: session.times.filter((_, i) => i !== index),
            plusTwoTimes: session.plusTwoTimes.filter(i => i !== index).map(i => i > index ? i - 1 : i),
            dnfTimes: session.dnfTimes.filter(i => i !== index).map(i => i > index ? i - 1 : i)
          }
        : session
    );
    setSessions(newSessions);
  };

  const requestDeleteTime = (index) => {
    if (dontAskAgain) {
      deleteTime(index);
    } else {
      setTimeToDeleteIndex(index);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteTime = () => {
    if (timeToDeleteIndex !== null) {
      deleteTime(timeToDeleteIndex);
    }
    setShowDeleteModal(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setShowDeleteModal(false);
      setShowSettings(false);
      setShowTimeDetailModal(false);
    }
  };

  // Funciones para el modal de detalles de tiempo
  const openTimeDetailModal = (index) => {
    setSelectedTimeDetail({
      index: index,
      time: activeSession.times[index].time,
      scramble: activeSession.times[index].scramble
    });
    setShowTimeDetailModal(true);
  };

  const applyPlusTwo = () => {
    if (selectedTimeDetail) {
      const newPlusTwoTimes = [...activeSession.plusTwoTimes];
      const index = newPlusTwoTimes.indexOf(selectedTimeDetail.index);
      
      if (index === -1) {
        newPlusTwoTimes.push(selectedTimeDetail.index);
        const newDnfTimes = activeSession.dnfTimes.filter(i => i !== selectedTimeDetail.index);
        
        const newSessions = sessions.map(session => 
          session.id === activeSessionId 
            ? {
                ...session,
                plusTwoTimes: newPlusTwoTimes,
                dnfTimes: newDnfTimes
              }
            : session
        );
        setSessions(newSessions);
      } else {
        newPlusTwoTimes.splice(index, 1);
        const newSessions = sessions.map(session => 
          session.id === activeSessionId 
            ? {
                ...session,
                plusTwoTimes: newPlusTwoTimes
              }
            : session
        );
        setSessions(newSessions);
      }
    }
  };

  const applyDnf = () => {
    if (selectedTimeDetail) {
      const newDnfTimes = [...activeSession.dnfTimes];
      const index = newDnfTimes.indexOf(selectedTimeDetail.index);
      
      if (index === -1) {
        newDnfTimes.push(selectedTimeDetail.index);
        const newPlusTwoTimes = activeSession.plusTwoTimes.filter(i => i !== selectedTimeDetail.index);
        
        const newSessions = sessions.map(session => 
          session.id === activeSessionId 
            ? {
                ...session,
                dnfTimes: newDnfTimes,
                plusTwoTimes: newPlusTwoTimes
              }
            : session
        );
        setSessions(newSessions);
      } else {
        newDnfTimes.splice(index, 1);
        const newSessions = sessions.map(session => 
          session.id === activeSessionId 
            ? {
                ...session,
                dnfTimes: newDnfTimes
              }
            : session
        );
        setSessions(newSessions);
      }
    }
  };

  // Efecto para verificar récords
  useEffect(() => {
    if (activeSession.times.length > 0 && bestTime !== null) {
      const currentTime = numericTimes[numericTimes.length - 1];
     
      if (currentTime === bestTime && (previousBestTime === null || currentTime < previousBestTime)) {
        setPreviousBestTime(bestTime);
        fireConfetti();
      }
    }
  }, [activeSession.times, bestTime]);
  
  const fireConfetti = () => {
    const duration = 2 * 1000; 
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
  };

  return (
    <div className={`app-container ${fullScreenTimer ? "full-screen-mode" : ""}`} style={{ backgroundColor: bgColor }}>
      {!fullScreenTimer && (
        <div className="sessions-menu">
          <select 
            value={activeSessionId}
            onChange={(e) => switchSession(e.target.value)}
            className="session-selector"
          >
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                {session.name} ({session.times.length})
              </option>
            ))}
          </select>
          <button 
            className="new-session-btn"
            onClick={createNewSession}
            title="Crear nueva sesión"
          >
            +
          </button>
        </div>
      )}

      {!fullScreenTimer && (
        <aside className="times-sidebar">
          <div className="sidebar-header">
            <h2>Historial de Tiempos</h2>
          </div>
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-label">Mejor</div>
              <div className="stat-value">{bestTime !== null ? formatTimeFull(bestTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ao5</div>
              <div className="stat-value">{ao5 !== null ? formatTimeFull(ao5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ao12</div>
              <div className="stat-value">{ao12 !== null ? formatTimeFull(ao12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--"}</div>
            </div>
          </div>
          <div className="times-list">
            {activeSession.times.length === 0 ? (
              <div className="empty-state">
                <p>No hay tiempos registrados aún</p>
              </div>
            ) : (
              activeSession.times.map((t, i) => (
                <div key={i} className={`time-entry ${numericTimes[i] === bestTime ? "best-time" : ""}`} onClick={() => openTimeDetailModal(i)}>
                  <div className="time-info">
                    <span className="time-index">{i + 1}.</span>
                    <span className="time-value">{formatTimeFull(t.time, i, activeSession.plusTwoTimes, activeSession.dnfTimes)}</span>
                    {numericTimes[i] === bestTime && <span className="best-badge">★</span>}
                  </div>
                  <button className="delete-btn" onClick={(e) => { e.stopPropagation(); requestDeleteTime(i); }} aria-label="Borrar tiempo">
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

        {/* Visualización del cubo */}
        {!fullScreenTimer && (
          <div className="cube-container"  style={{ backgroundColor: bgColor, padding: '10px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', position: 'fixed', bottom: '20px', right: '20px', zIndex: 10 }}>
            <CubeVisualization cubeState={cubeState} />
          </div>
        )}
      </main>

      {/* Modal de configuración */}
      {showSettings && (
        <div className="modal-overlay settings-modal" onClick={handleOutsideClick}>
          <div className="settings-content" onClick={(e) => e.stopPropagation()}>
            <div className="settings-sidebar">
              <button
                className={`settings-tab ${activeSettingsTab === "apariencia" ? "active" : ""}`}
                onClick={() => setActiveSettingsTab("apariencia")}
              >
                🎨 Apariencia
              </button>
              <button
                className={`settings-tab ${activeSettingsTab === "comportamiento" ? "active" : ""}`}
                onClick={() => setActiveSettingsTab("comportamiento")}
              >
                ⚙️ Comportamiento
              </button>
              <button
                className={`settings-tab ${activeSettingsTab === "tiempos" ? "active" : ""}`}
                onClick={() => setActiveSettingsTab("tiempos")}
              >
                ⏱️ Tiempos
              </button>
              <button
                className={`settings-tab ${activeSettingsTab === "sesiones" ? "active" : ""}`}
                onClick={() => setActiveSettingsTab("sesiones")}
              >
                📁 Sesiones
              </button>
              <button
                className={`settings-tab ${activeSettingsTab === "scramble" ? "active" : ""}`}
                onClick={() => setActiveSettingsTab("scramble")}
              >
                🔀 Scramble
              </button>
            </div>

            <div className="settings-main">
              {activeSettingsTab === "apariencia" && (
                <div className="settings-section">
                  <h3>Personalización Visual</h3>
                  <div className="setting-group">
                    <label>
                      Color de fondo:
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                    </label>
                  </div>
                  <div className="setting-group">
                    <label>
                      Color del timer:
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                    </label>
                  </div>
                  <div className="setting-group">
                    <label>
                      Color del scramble:
                      <input type="color" value={scrambleColor} onChange={(e) => setScrambleColor(e.target.value)} />
                    </label>
                  </div>
                  <div className="setting-group">
                    <label>
                      Tamaño del timer: {timerSize}%
                      <input
                        type="range"
                        min="10"
                        max="450"
                        value={timerSize}
                        onChange={(e) => setTimerSize(parseInt(e.target.value))}
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeSettingsTab === "comportamiento" && (
                <div className="settings-section">
                  <h3>Comportamiento del Timer</h3>
                  <div className="setting-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={holdToStart}
                        onChange={(e) => setHoldToStart(e.target.checked)}
                      />
                      <span className="slider"></span>
                      Mantener espacio para iniciar
                    </label>
                    <p className="setting-description">Desactívalo para iniciar/detener con un solo clic</p>
                  </div>
                  <div className="setting-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={inspectionTime}
                        onChange={(e) => setInspectionTime(e.target.checked)}
                      />
                      <span className="slider"></span>
                      Habilitar tiempo de inspección
                    </label>
                    {inspectionTime && (
                      <div className="setting-subgroup">
                        <label>
                          Duración (segundos):
                          <input
                            type="number"
                            min="5"
                            max="60"
                            value={inspectionDuration}
                            onChange={(e) => setInspectionDuration(Math.max(5, Math.min(60, parseInt(e.target.value) || 15)))}
                          />
                        </label>
                      </div>
                    )}
                    <p className="setting-description">Tiempo para inspeccionar el cubo antes de comenzar</p>
                  </div>
                </div>
              )}

              {activeSettingsTab === "tiempos" && (
                <div className="settings-section">
                  <h3>Gestión de Tiempos</h3>
                  <div className="setting-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={dontAskAgain}
                        onChange={(e) => setDontAskAgain(e.target.checked)}
                      />
                      <span className="slider"></span>
                      No preguntar antes de borrar
                    </label>
                  </div>
                  <div className="setting-group">
                    <button className="danger-button" onClick={resetTimes}>
                      Borrar todos los tiempos
                    </button>
                    <p className="setting-description">Esta acción borrará los tiempos solo de la sesión actual</p>
                  </div>
                </div>
              )}

              {activeSettingsTab === "sesiones" && (
                <div className="settings-section">
                  <h3>Gestión de Sesiones</h3>
                  <div className="sessions-list">
                    {sessions.map(session => (
                      <div key={session.id} className="session-item">
                        <input
                          type="text"
                          value={session.name}
                          onChange={(e) => renameSession(session.id, e.target.value)}
                        />
                        <span>{session.times.length} tiempos</span>
                        {sessions.length > 1 && (
                          <button 
                            className="danger-button small"
                            onClick={() => deleteSession(session.id)}
                            disabled={session.id === activeSessionId}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="primary-button" onClick={createNewSession}>
                    Crear Nueva Sesión
                  </button>
                </div>
              )}

              {activeSettingsTab === "scramble" && (
                <div className="settings-section">
                  <h3>Configuración de Scramble</h3>
                  <div className="setting-group">
                    <label>
                      Tamaño del texto:
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={scrambleSize}
                        onChange={(e) => setScrambleSize(parseInt(e.target.value))}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="settings-footer">
                <button className="close-button" onClick={() => setShowSettings(false)}>
                  Cerrar Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para borrar tiempo */}
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

      {/* Modal de detalles de tiempo */}
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
    </div>
  );
}

export default App;