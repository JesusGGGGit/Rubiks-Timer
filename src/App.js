import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTheme } from './Hooks/useTheme';
import { useSessions } from './Hooks/useSessions';
import Timer from './components/Timer/Timer';
import Estadisticas from './components/Estadisticas/Estadisticas';
import { useEffect } from 'react';
import './App.css';

function AppContent() {
  const { bgColor, textColor } = useTheme();
  const { sessions } = useSessions();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [location.pathname]);

  return (
    <div>
      <nav>
        <Link to="/">Timer</Link>
        <span className="nav-separator">|</span>
        <Link to="/estadisticas">Estadísticas</Link>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Timer />} />
          <Route path="/estadisticas" element={<Estadisticas sessions={sessions} />} />
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
