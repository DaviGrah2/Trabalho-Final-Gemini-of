import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Diagnostico from './pages/Diagnostico.jsx';
import Trilha from './pages/Trilha.jsx';
import Topico from './pages/Topico.jsx';
import Painel from './pages/Painel.jsx';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Aprendizagem Adaptativa</h1>
          <p>Plataforma de estudo inteligente com IA</p>
        </div>
        <nav>
          <Link to="/">Início</Link>
          <Link to="/diagnostico">Diagnóstico</Link>
          <Link to="/trilha">Trilha</Link>
          <Link to="/painel">Painel</Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="/trilha" element={<Trilha />} />
          <Route path="/topico/:id" element={<Topico />} />
          <Route path="/painel" element={<Painel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
