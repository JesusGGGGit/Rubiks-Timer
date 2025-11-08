import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { user, loading, error, signIn, signUp, signInWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setAuthError(e.message || 'Error al iniciar sesión');
    }
  };

  const handleSignUp = async () => {
    setAuthError(null);
    try {
      await signUp(email, password);
    } catch (e) {
      setAuthError(e.message || 'Error al crear cuenta');
    }
  };

  const handleGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setAuthError(e.message || 'Error al iniciar con Google');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-header">
          <h2>Rubiks Timer</h2>
          <p className="login-sub">Gestiona tus tiempos y sesiones — inicia sesión para sincronizar con la nube</p>
        </header>

        {user ? (
          <div className="logged-area">
            <p>Conectado como <strong>{user.email}</strong></p>
            <button className="primary-button" onClick={() => logout()}>Cerrar sesión</button>
          </div>
        ) : (
          <div className="login-form">
            <label className="field">
              <span className="label-text">Email</span>
              <input className="text-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="field">
              <span className="label-text">Contraseña</span>
              <input className="text-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>

            <div className="login-actions">
              <button className="primary-button" onClick={handleSignIn}>Iniciar sesión</button>
              <button className="secondary-button" onClick={handleSignUp}>Crear cuenta</button>
            </div>

            <div className="divider"><span>o</span></div>

            <div className="google-wrap">
              <button className="google-button" onClick={handleGoogle} aria-label="Iniciar sesión con Google">
                <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" width="18" height="18" aria-hidden="true">
                  <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.5-36.6-4.4-54H272v102.3h147.3c-6.4 34.3-25.8 63.4-55 83v68.9h88.8c52-48 81.4-118.3 81.4-200.2z"/>
                  <path fill="#34A853" d="M272 544.3c73.6 0 135.5-24.4 180.7-66.4l-88.8-68.9c-24.9 16.8-56.6 26.7-91.9 26.7-70.7 0-130.6-47.6-152-111.4H29.6v69.8C74.8 488.7 168.5 544.3 272 544.3z"/>
                  <path fill="#FBBC05" d="M120 327.3c-11.6-34.5-11.6-71.7 0-106.2V151.3H29.6c-39.9 79.6-39.9 173.3 0 252.9L120 327.3z"/>
                  <path fill="#EA4335" d="M272 107.7c39 0 74.1 13.4 101.7 39l76.3-76.3C411.8 24.4 349.9 0 272 0 168.5 0 74.8 55.6 29.6 151.3l90.4 69.8c21.4-63.8 81.3-111.4 152-111.4z"/>
                </svg>
                <span className="google-text">Iniciar sesión con Google</span>
              </button>
            </div>

            {authError && <p className="error-text">{authError}</p>}
            {error && <p className="error-text">{error.message}</p>}
          </div>
        )}

        {loading && <p className="muted">Cargando...</p>}
      </div>
    </div>
  );
}
