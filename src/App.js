import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import confetti from "canvas-confetti";
import SettingsModal from "./components/SettingsModal"; 
import CubeVisualization from './components/CubeVisualization'; 
import { parseScramble } from './utils/cubeUtils'; 

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

function App() {
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
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionCubeType, setNewSessionCubeType] = useState("3x3");

  const numericTimes = activeSession.times.map((t, i) => {
    if (activeSession.dnfTimes.includes(i)) return null;
    if (t.time === "DNF") return null;
    return activeSession.plusTwoTimes.includes(i) ? t.time + 2000 : t.time;
  }).filter(t => t !== null);

  const bestTime = numericTimes.length > 0 ? Math.min(...numericTimes) : null;
  const worstTime = numericTimes.length > 0 ? Math.max(...numericTimes) : null;
  const totalSolves = activeSession.times.length;
  const overallAverage = numericTimes.length > 0 ? numericTimes.reduce((a, b) => a + b, 0) / numericTimes.length : null;

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
  };

  const handleKeyDown = (e) => {
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
  };

  const handleKeyUp = (e) => {
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

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSessionId);
  };

  const switchSession = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  const renameSession = (sessionId, newName) => {
    setSessions(prevSessions => prevSessions.map(session =>
      session.id === sessionId ? {...session, name: newName} : session
    ));
  };

  const deleteSession = (sessionId) => {
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
  };

  const resetTimes = () => {
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
  };

  const handleCreateSession = () => {
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
  };

  const deleteTime = (index) => {
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
      setShowTimeDetailModal(false);
      setShowNewSessionForm(false);
    }
  };

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
  };

  const applyDnf = () => {
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
  };

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
  };

  return (
    <div className={`app-container ${fullScreenTimer ? "full-screen-mode" : ""}`} style={{ backgroundColor: bgColor }}>
      
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
              <div className="stat-label">Peor</div>
              <div className="stat-value">{worstTime !== null ? formatTimeFull(worstTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value">{totalSolves}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ao5</div>
              <div className="stat-value">{ao5 !== null ? formatTimeFull(ao5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ao12</div>
              <div className="stat-value">{ao12 !== null ? formatTimeFull(ao12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Promedio General</div>
              <div className="stat-value">{overallAverage !== null ? formatTimeFull(overallAverage, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--"}</div>
            </div>
          </div>
          
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
              onClick={() => setShowNewSessionForm(true)}
              title="Crear nueva sesión"
            >
              +
            </button>
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
            <CubeVisualization cubeState={cubeState} />
          </div>
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
    </div>
  );
}

export default App;