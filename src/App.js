import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Timer from './components/Timer/Timer';
import Estadisticas from './components/Estadisticas/Estadisticas';
import LoginPage from './components/Login/LoginPage';
import SettingsPage from './components/Settings/SettingsPage';
import SettingsModal from './components/Settings/SettingsModal';
import './App.css';
import './nav.css';
import { useAuth } from './components/Context/AuthContext';
import { useTheme } from './components/Hooks/useTheme';
import { useSettings } from './components/Hooks/useSettings';
import { useSessions } from './components/Hooks/useSessions';

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const { user } = useAuth();

  // Global settings modal state so it can be opened from anywhere
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('apariencia');

  // Hooks providing the props expected by SettingsModal
  const theme = useTheme();
  const settings = useSettings();
  const sessionsHooks = useSessions();

  return (
    <div>
      <nav>
        <button className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className="nav-center">
          <Link to="/" onClick={() => setMenuOpen(false)}>Timer</Link>
          <span className="nav-separator">|</span>
          <Link to="/estadisticas" onClick={() => setMenuOpen(false)}>Estadísticas</Link>
          <span className="nav-separator">|</span>
          <button className="link-like" onClick={() => { setShowSettings(true); setMenuOpen(false); }}>Configuración</button>
        </div>

        {user ? (
          <div className="user-badge">{user.displayName || user.email}</div>
        ) : (
          <Link to="/login" className="settings-button" onClick={() => setMenuOpen(false)}>
            Iniciar sesión
          </Link>
        )}
      </nav>

      {/* Barra de navegación inferior para móvil */}
      <div className={`mobile-bottom-nav ${menuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)} className="bottom-nav-item" aria-label="Timer">
          <div className="icon">⏱️</div>
          <div className="label">Timer</div>
        </Link>
        <Link to="/estadisticas" onClick={() => setMenuOpen(false)} className="bottom-nav-item" aria-label="Estadísticas">
          <div className="icon">📊</div>
          <div className="label">Estadísticas</div>
        </Link>
        <button className="bottom-nav-item" onClick={() => { setShowSettings(true); setMenuOpen(false); }} aria-label="Configuración">
          <div className="icon">⚙️</div>
          <div className="label">Config</div>
        </button>
        {user ? (
          <div className="bottom-nav-item user-badge-mobile">{user.displayName || user.email}</div>
        ) : (
          <Link to="/login" className="bottom-nav-item" onClick={() => setMenuOpen(false)} aria-label="Iniciar sesión">
            <div className="icon">🔐</div>
            <div className="label">Entrar</div>
          </Link>
        )}
      </div>

      <main>
        <Routes>
          <Route path="/" element={<Timer settings={settings} />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/settings" element={<SettingsPage settings={settings} />} />
        </Routes>
      </main>

      {/* Global Settings Modal rendered at top level so it can be opened anywhere */}
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        activeSettingsTab={activeSettingsTab}
        setActiveSettingsTab={setActiveSettingsTab}
        bgColor={theme.bgColor}
        setBgColor={theme.setBgColor}
        textColor={theme.textColor}
        setTextColor={theme.setTextColor}
        scrambleColor={theme.scrambleColor}
        setScrambleColor={theme.setScrambleColor}
        timerSize={theme.timerSize}
        setTimerSize={theme.setTimerSize}
        holdToStart={settings.holdToStart}
        setHoldToStart={settings.setHoldToStart}
        inspectionTime={settings.inspectionTime}
        setInspectionTime={settings.setInspectionTime}
        inspectionDuration={settings.inspectionDuration}
        setInspectionDuration={settings.setInspectionDuration}
  dontAskAgain={settings.dontAskAgain}
  setDontAskAgain={settings.setDontAskAgain}
  showCube={settings.showCube}
  setShowCube={settings.setShowCube}
        resetTimes={sessionsHooks.resetTimes}
        sessions={sessionsHooks.sessions}
        renameSession={sessionsHooks.renameSession}
        deleteSession={sessionsHooks.deleteSession}
        activeSessionId={sessionsHooks.activeSessionId}
        createNewSession={sessionsHooks.createNewSession}
        scrambleSize={theme.scrambleSize}
        setScrambleSize={theme.setScrambleSize}
        cubeSize={theme.cubeSize}
        setCubeSize={theme.setCubeSize}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;