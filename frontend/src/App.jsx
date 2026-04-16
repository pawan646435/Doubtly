// frontend/src/App.jsx
// Main application component with routing

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage/HomePage';
import SolverPage from './pages/SolverPage/SolverPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import CodingSolverPage from './pages/CodingSolverPage/CodingSolverPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/solve" element={<SolverPage />} />
          <Route path="/coding" element={<CodingSolverPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
