import { useState, useEffect, useCallback } from 'react';

export function useSessions() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("sessions");
    return saved ? JSON.parse(saved) : [{
      id: 'default',
      name: 'Sesión Principal',
      cubeType: '3x3',
      times: [],
      plusTwoTimes: [],
      dnfTimes: [],
      createdAt: new Date().toISOString()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem("activeSessionId") || 'default';
  });

  const [showNewSessionForm, setShowNewSessionForm] = useState(false);

  const [newSessionName, setNewSessionName] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [newSessionCubeType, setNewSessionCubeType] = useState("3x3");

  const openNewSessionForm = useCallback(() => {
    const today = new Date();
    setNewSessionName(today.toISOString().split('T')[0]);
    setShowNewSessionForm(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("activeSessionId", activeSessionId);
  }, [activeSessionId]);

  const createNewSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      name: newSessionName || `Sesión ${sessions.length + 1}`,
      times: [],
      plusTwoTimes: [],
      dnfTimes: [],
      createdAt: new Date().toISOString(),
      cubeType: newSessionCubeType || '3x3'
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSessionId);

    // Limpiar formulario
    setShowNewSessionForm(false);
    setNewSessionName("");
    setNewSessionCubeType("3x3");
  }, [newSessionName, newSessionCubeType, sessions.length]);

  const switchSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
  }, []);

  const renameSession = useCallback((sessionId, newName) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId ? { ...session, name: newName } : session
      )
    );
  }, []);

  const deleteSession = useCallback((sessionId) => {
    if (sessions.length <= 1) {
      alert("Debe haber al menos una sesión");
      return;
    }

    if (window.confirm("¿Estás seguro de que quieres eliminar esta sesión?")) {
      setSessions(prevSessions => {
        const newSessions = prevSessions.filter(s => s.id !== sessionId);
        return newSessions;
      });

      if (activeSessionId === sessionId) {
        setActiveSessionId(sessions[0].id);
      }
    }
  }, [activeSessionId, sessions]);

  const resetTimes = useCallback((sessionId) => {
    if (window.confirm("¿Estás seguro de que quieres borrar todos los tiempos de esta sesión?")) {
      setSessions(prevSessions => prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, times: [], plusTwoTimes: [], dnfTimes: [] }
          : session
      ));
    }
  }, []);

  const addSession = useCallback((name, cubeType = "3x3") => {
    if (!name.trim()) return;

    const newSession = {
      id: Date.now().toString(),
      name,
      cubeType,
      times: [],
      plusTwoTimes: [],
      dnfTimes: [],
      createdAt: new Date().toISOString()
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  }, []);

  return {
    sessions,
    activeSessionId,
    activeSession: sessions.find(s => s.id === activeSessionId) || sessions[0],
    setSessions,
    setActiveSessionId,
    createNewSession,
    switchSession,
    renameSession,
    deleteSession,
    resetTimes,
    addSession,
    showNewSessionForm,
    setShowNewSessionForm,
    newSessionName,
    setNewSessionName,
    newSessionCubeType,
    setNewSessionCubeType,
    openNewSessionForm,
  };
}
