import { useState, useEffect, useRef, useCallback } from "react";

export const useTimerLogic = ({
  inspectionTime,
  inspectionDuration,
  holdToStart,
  scramble,
  generateScramble,
  activeSessionId,
  setSessions,
  onNewSolve,
}) => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [inspectionRunning, setInspectionRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [dnf, setDnf] = useState(false);
  const [showDnf, setShowDnf] = useState(false);

  const intervalRef = useRef(null);
  const inspectionIntervalRef = useRef(null);
  const holdTimeoutRef = useRef(null);

  const runningRef = useRef(running);
  const inspectionRunningRef = useRef(inspectionRunning);
  const readyRef = useRef(ready);
  const dnfRef = useRef(dnf);
  const showDnfRef = useRef(showDnf);
  const timeRef = useRef(time);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { inspectionRunningRef.current = inspectionRunning; }, [inspectionRunning]);
  useEffect(() => { readyRef.current = ready; }, [ready]);
  useEffect(() => { dnfRef.current = dnf; }, [dnf]);
  useEffect(() => { showDnfRef.current = showDnf; }, [showDnf]);
  useEffect(() => { timeRef.current = time; }, [time]);

  const isInTimerContainer = (element) => {
    while (element !== null && element !== document.body) {
      if (element.classList?.contains('timer-container')) {
        return true;
      }
      element = element.parentNode;
    }
    return false;
  };

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
        setSessions(prev => prev.map(session =>
          session.id === activeSessionId
            ? {
                ...session,
                times: [...session.times, { time: "DNF", scramble }],
                dnfTimes: [...session.dnfTimes, session.times.length],
              }
            : session
        ));
        generateScramble();
      }
    }, 1000);
  }, [inspectionDuration, activeSessionId, scramble, setSessions, generateScramble]);

  const handleStart = useCallback((e) => {
    // Verificar si el evento ocurrió dentro del timer-container
    if (!isInTimerContainer(e.target)) return;
    
    // Para eventos de teclado, verificar si es la tecla espacio
    if (e.type === 'keydown' && e.code !== "Space") return;
    
    // Ignorar si el evento proviene de un input o textarea
    if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;
    
    e.preventDefault();
    if (showDnfRef.current) {
      setShowDnf(false);
      if (inspectionTime) startInspection();
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
        if (inspectionRunningRef.current) setReady(true);
      }, 500);
    }
  }, [holdToStart, inspectionTime, startInspection]);

  const handleStop = useCallback((e) => {
    // Verificar si el evento ocurrió dentro del timer-container
    if (!isInTimerContainer(e.target)) return;
    
    // Para eventos de teclado, verificar si es la tecla espacio
    if (e.type === 'keyup' && e.code !== "Space") return;
    
    // Ignorar si el evento proviene de un input o textarea
    if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;
    
    e.preventDefault();
    clearTimeout(holdTimeoutRef.current);
    if (showDnfRef.current) return;

    if (readyRef.current) {
      setTime(0);
      setRunning(true);
      setReady(false);
      setInspectionRunning(false);
      clearInterval(inspectionIntervalRef.current);
    } else if (runningRef.current) {
      setRunning(false);
      if (timeRef.current > 0) {
        setSessions(prev => prev.map(session =>
          session.id === activeSessionId
            ? {
                ...session,
                times: [...session.times, { time: timeRef.current, scramble }],
              }
            : session
        ));
        onNewSolve?.(timeRef.current);
      }
      generateScramble();
    }
  }, [activeSessionId, scramble, generateScramble, setSessions, onNewSolve]);

  useEffect(() => {
    // Eventos de teclado
    window.addEventListener("keydown", handleStart);
    window.addEventListener("keyup", handleStop);
    
    // Eventos táctiles
    window.addEventListener("touchstart", handleStart, { passive: false });
    window.addEventListener("touchend", handleStop, { passive: false });
    
    return () => {
      // Limpiar eventos de teclado
      window.removeEventListener("keydown", handleStart);
      window.removeEventListener("keyup", handleStop);
      
      // Limpiar eventos táctiles
      window.removeEventListener("touchstart", handleStart);
      window.removeEventListener("touchend", handleStop);
      
      clearInterval(intervalRef.current);
      clearInterval(inspectionIntervalRef.current);
      clearTimeout(holdTimeoutRef.current);
    };
  }, [handleStart, handleStop]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 10);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  return {
    time,
    running,
    inspectionRunning,
    dnf,
    showDnf,
    ready,
  };
};