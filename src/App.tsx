import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TripWorkspace from './components/TripWorkspace';
import TripListPage from './components/TripListPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ backgroundColor: '#faf9f7' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trips" element={<TripListPage />} />
          <Route path="/trips/:tripId" element={<TripWorkspace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
