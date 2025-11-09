import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../Context/AuthContext';

export const DEFAULT_SESSION = {
  id: 'default',
  name: 'Sesión Principal',
  cubeType: '3x3',
  times: [],
  plusTwoTimes: [],
  dnfTimes: [],
  createdAt: new Date().toISOString()
};

export function useSessions() {

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("sessions");
    return saved ? JSON.parse(saved) : [DEFAULT_SESSION];
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

  // Firestore document reference where we store sessions/app state per-user
  // keep a stable ref so effects don't need to include it in dependency arrays
  const userDocRefRef = useRef(null);
  const initializingRef = useRef(true);
  const { user } = useAuth();

  useEffect(() => {
    // Persist locally immediately
    localStorage.setItem("sessions", JSON.stringify(sessions));
    // Persist to Firestore for logged-in user; fall back to localStorage on error
    const userDocRef = userDocRefRef.current;
    if (!userDocRef) return;
    if (initializingRef.current) return;

    (async () => {
      try {
        await updateDoc(userDocRef, { sessions });
      } catch (err) {
        // If updateDoc fails because doc doesn't exist, try setDoc
        try {
          await setDoc(userDocRef, { sessions, activeSessionId });
        } catch (e) {
          console.error('Error saving sessions to Firestore, localStorage used as fallback', e);
        }
      }
    })();
  }, [sessions, activeSessionId]);

  useEffect(() => {
    localStorage.setItem("activeSessionId", activeSessionId);
    const userDocRef = userDocRefRef.current;
    if (!userDocRef) return;
    if (initializingRef.current) return;

    (async () => {
      try {
        await updateDoc(userDocRef, { activeSessionId });
      } catch (err) {
        try {
          await setDoc(userDocRef, { sessions, activeSessionId });
        } catch (e) {
          console.error('Error saving activeSessionId to Firestore, localStorage used as fallback', e);
        }
      }
    })();
  }, [activeSessionId, sessions]);

  // Subscribe to Firestore user doc when user logs in. If no user, remain on localStorage only.
  useEffect(() => {
    let unsub;
    (async () => {
      try {
        if (!user) {
          // no user -> keep using localStorage
          userDocRefRef.current = null;
          initializingRef.current = false;
          return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        userDocRefRef.current = userDocRef;

        const initialLocalSessions = JSON.parse(localStorage.getItem('sessions') || 'null') || [DEFAULT_SESSION];
        const initialLocalActive = localStorage.getItem('activeSessionId') || 'default';

        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.sessions) setSessions(data.sessions);
          if (data.activeSessionId) setActiveSessionId(data.activeSessionId);
        } else {
          // If Firestore doc doesn't exist, seed it with the local sessions (so quiet merge)
          await setDoc(userDocRef, { sessions: initialLocalSessions, activeSessionId: initialLocalActive });
        }

        // subscribe for live updates
        unsub = onSnapshot(userDocRef, (docSnap) => {
          if (!docSnap.exists()) return;
          const data = docSnap.data();
          if (data.sessions) setSessions(data.sessions);
          if (data.activeSessionId) setActiveSessionId(data.activeSessionId);
        });
      } catch (err) {
        console.warn('Firestore unavailable, falling back to localStorage', err);
        userDocRefRef.current = null;
      } finally {
        // mark that initialization finished so effects can write
        initializingRef.current = false;
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [user]);

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
    // If sessionId not provided, default to current active session
    const targetId = sessionId || activeSessionId;
    if (!targetId) return;

    if (window.confirm("¿Estás seguro de que quieres borrar todos los tiempos de esta sesión?")) {
      setSessions(prevSessions => prevSessions.map(session =>
        session.id === targetId
          ? { ...session, times: [], plusTwoTimes: [], dnfTimes: [] }
          : session
      ));
    }
  }, [activeSessionId]);

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
