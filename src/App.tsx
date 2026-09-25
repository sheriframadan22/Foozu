import { HashRouter, Routes, Route } from 'react-router-dom';
import GamePage from './pages/Game/GamePage';
import AdminPage from './pages/Admin/AdminPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  );
}
