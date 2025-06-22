import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../App.css";
import confetti from "canvas-confetti";
import SettingsModal from '../Settings/SettingsModal';
import { parseScramble } from '../../utils/cubeUtils'; 
import { formatTimeDisplay, formatTimeFull } from '../../utils/formatUtils';
import {calculateStats} from '../../utils/calculateStats';
import {getStdDevColor } from '../../utils/Descriptions';
import { getSortedTimes } from '../../utils/sorting';
import StatDetailModal from '../StatDetailModal/StatDetailModal';
import Modals from '../TimesModal/TimesModal';
import TimesSidebar from '../SideBar/SideBar';
import MainContent from '../MainContent/MainContent';
import { useTheme } from '../../Hooks/useTheme';


function App() {
const {
  bgColor, setBgColor,
  textColor, setTextColor,
  scrambleColor, setScrambleColor,
  timerSize, setTimerSize,
  scrambleSize, setScrambleSize
} = useTheme();



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



  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [inspectionRunning, setInspectionRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [scramble, setScramble] = useState("Generating scramble...");
  const [cubeState, setCubeState] = useState(parseScramble(""));
  const [fullScreenTimer, setFullScreenTimer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timeToDeleteIndex, setTimeToDeleteIndex] = useState(null);
  const [dontAskAgain, setDontAskAgain] = useState(() => {
    return localStorage.getItem("dontAskDelete") === "true";
  });
  const [activeSettingsTab, setActiveSettingsTab] = useState("apariencia");

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
    localStorage.setItem("dontAskDelete", dontAskAgain ? "true" : "false");
  }, [dontAskAgain]);



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

 return (
    <div className={`app-container ${fullScreenTimer ? "full-screen-mode" : ""}`} style={{ backgroundColor: bgColor }}>
      {!fullScreenTimer && (
        <TimesSidebar
          stats={stats}
          activeSession={activeSession}
          sessions={sessions}
          activeSessionId={activeSessionId}
          switchSession={switchSession}
          openNewSessionForm={openNewSessionForm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showNewSessionForm={showNewSessionForm}
          setShowNewSessionForm={setShowNewSessionForm}
          newSessionName={newSessionName}
          setNewSessionName={setNewSessionName}
          newSessionCubeType={newSessionCubeType}
          setNewSessionCubeType={setNewSessionCubeType}
          handleCreateSession={handleCreateSession}
          handleOutsideClick={handleOutsideClick}
          openStatDetail={openStatDetail}
          openTimeDetailModal={openTimeDetailModal}
          requestDeleteTime={requestDeleteTime}
          formatTimeFull={formatTimeFull}
          getSortedTimes={getSortedTimes}
          getStdDevColor={getStdDevColor}
        />
      )}
      
    <MainContent
  fullScreenTimer={fullScreenTimer}
  setShowSettings={setShowSettings}
  scrambleColor={scrambleColor}
  scramble={scramble}
  showDnf={showDnf}
  inspectionRunning={inspectionRunning}
  textColor={textColor}
  formatTimeDisplay={formatTimeDisplay}
  time={time}
  ready={ready}
  inspectionTime={inspectionTime}
  holdToStart={holdToStart}
  bgColor={bgColor}
  cubeState={cubeState}
  activeSession={activeSession}
/>


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
      
      <Modals
  showDeleteModal={showDeleteModal}
  onCancelDelete={() => setShowDeleteModal(false)}
  onConfirmDelete={confirmDeleteTime}
  dontAskAgain={dontAskAgain}
  setDontAskAgain={setDontAskAgain}
  showTimeDetailModal={showTimeDetailModal}
  timeDetail={selectedTimeDetail}
  onCloseDetail={() => setShowTimeDetailModal(false)}
  applyPlusTwo={applyPlusTwo}
  applyDnf={applyDnf}
  plusTwoTimes={activeSession.plusTwoTimes}
  dnfTimes={activeSession.dnfTimes}
/>


      {showStatsModal && (
        <StatDetailModal
          selectedStat={selectedStat}
          stats={stats}
          activeSession={activeSession}
          setShowStatsModal={setShowStatsModal}
          openTimeDetailModal={openTimeDetailModal}
        />
      )}
    </div>
  );
}

export default App;