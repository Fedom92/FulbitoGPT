import { Routes, Route, Navigate } from 'react-router-dom';
import FormationBoard from './pages/FormationBoard.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<FormationBoard />} />
      <Route path="/f/:id" element={<FormationBoard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
