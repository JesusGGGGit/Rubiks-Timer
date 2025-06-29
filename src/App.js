import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useSessions } from '../src/components/Hooks/useSessions';
import Timer from './components/Timer/Timer';
import Estadisticas from './components/Estadisticas/Estadisticas';
import './App.css';
import './nav.css';

function AppContent() {
  const { sessions } = useSessions();



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
