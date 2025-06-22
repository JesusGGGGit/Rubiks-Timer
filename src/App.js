import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Timer from './components/Timer/Timer';
import Estadisticas from './Estadisticas';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Timer</Link> |
        <Link to="/estadisticas">Estadísticas</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Timer />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
      </Routes>
    </Router>
  );
}

export default App;
