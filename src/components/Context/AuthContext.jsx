import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signUp = async (email, password) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      return res.user;
    } catch (e) {
      setError(e);
      throw e;
    }
  };

  const signIn = async (email, password) => {
    setError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      return res.user;
    } catch (e) {
      setError(e);
      throw e;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
      return res.user;
    } catch (e) {
      setError(e);
      throw e;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      setError(e);
      throw e;
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
