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
  const pressStartTimeRef = useRef(null);

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
    if (!element || element === document.body) return false;
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

    if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current);

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
    if (e.type.includes('touch') && !isInTimerContainer(e.target)) return;
    if (e.type === 'keydown' && e.code !== "Space" && e.key !== " ") return;
    if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;

    e.preventDefault();

    pressStartTimeRef.current = performance.now();

    if (showDnfRef.current) {
      setShowDnf(false);
      if (inspectionTime) startInspection();
      return;
    }

    if (!runningRef.current && !inspectionRunningRef.current && !readyRef.current) {
      if (inspectionTime) {
        startInspection();
      } else {
        if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = setTimeout(() => {
          setReady(true);
        }, holdToStart ? 500 : 0);
      }
    }

    if (inspectionRunningRef.current && !readyRef.current) {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = setTimeout(() => {
        if (inspectionRunningRef.current) setReady(true);
      }, 500);
    }
  }, [holdToStart, inspectionTime, startInspection]);
const handleStop = useCallback((e) => {
  if (e.type.includes('touch') && !isInTimerContainer(e.target)) return;
  if (e.type === 'keyup' && e.code !== "Space" && e.key !== " ") return;
  if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;

  e.preventDefault();

  if (holdTimeoutRef.current) {
    clearTimeout(holdTimeoutRef.current);
    holdTimeoutRef.current = null;
  }

  const holdTime = performance.now() - (pressStartTimeRef.current || 0);

  if (!readyRef.current && !runningRef.current) {
    if (holdToStart && holdTime < 500) {
      return; 
    }
  }

  if (showDnfRef.current) return;

  if (readyRef.current) {
    setTime(0);
    setRunning(true);
    setReady(false);
    setInspectionRunning(false);
    if (inspectionIntervalRef.current) {
      clearInterval(inspectionIntervalRef.current);
      inspectionIntervalRef.current = null;
    }
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
}, [activeSessionId, scramble, generateScramble, holdToStart, setSessions, onNewSolve]);


  useEffect(() => {
    const keyDownHandler = (e) => handleStart(e);
    const keyUpHandler = (e) => handleStop(e);
    const touchStartHandler = (e) => handleStart(e);
    const touchEndHandler = (e) => handleStop(e);

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    window.addEventListener("touchstart", touchStartHandler, { passive: false });
    window.addEventListener("touchend", touchEndHandler, { passive: false });

    return () => {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
      window.removeEventListener("touchstart", touchStartHandler);
      window.removeEventListener("touchend", touchEndHandler);

      if (intervalRef.current) clearInterval(intervalRef.current);
      if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, [handleStart, handleStop]);

  useEffect(() => {
    if (running) {
      const startTime = Date.now() - timeRef.current;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
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
