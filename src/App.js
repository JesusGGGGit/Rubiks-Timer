import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Timer from './components/Timer/Timer';
import Estadisticas from './components/Estadisticas/Estadisticas';
import './App.css';
import './nav.css';

function AppContent() {
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
        </div>
        
        <button 
          className="settings-button" 
          onClick={() => {
            setShowSettings(true);
            setMenuOpen(false);
          }}
        >
          Configuración
        </button>
      </nav>

      {/* Menú móvil */}
      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Timer</Link>
        <Link to="/estadisticas" onClick={() => setMenuOpen(false)}>Estadísticas</Link>
        <button 
          className="mobile-settings-button" 
          onClick={() => {
            setShowSettings(true);
            setMenuOpen(false);
          }}
        >
          Configuración
        </button>
      </div>

      <main>
        <Routes>
          <Route path="/" element={
            <Timer 
              showSettings={showSettings} 
              setShowSettings={setShowSettings}
            />} 
          />
          <Route path="/estadisticas" element={<Estadisticas />} />
        </Routes>
      </main>
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