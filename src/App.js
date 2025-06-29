import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Timer from './components/Timer/Timer';
import Estadisticas from './components/Estadisticas/Estadisticas';
import './App.css';
import './nav.css';

function AppContent() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div>
      <nav>
        <div className="nav-center">
          <Link to="/">Timer</Link>
          <span className="nav-separator">|</span>
          <Link to="/estadisticas">Estadísticas</Link>
        </div>
        <button 
          className="settings-button" 
          onClick={() => setShowSettings(true)}
        >
          Configuración
        </button>
      </nav>

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