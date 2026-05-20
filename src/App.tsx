import { useState } from 'react';
import LandingPage from './components/LandingPage';
import TripWorkspace from './components/TripWorkspace';

type View = 'landing' | 'app';

export default function App() {
  const [view, setView] = useState<View>('landing');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f7' }}>
      {view === 'landing' ? (
        <LandingPage onEnterDemo={() => setView('app')} />
      ) : (
        <TripWorkspace onBack={() => setView('landing')} />
      )}
    </div>
  );
}
