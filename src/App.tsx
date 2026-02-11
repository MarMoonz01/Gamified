import SanctuaryLayout from './core/SanctuaryLayout';
import Landing from './features/Landing';
import Sanctuary from './features/Sanctuary';
import Hatchery from './features/Hatchery';
import Codex from './features/Codex';
import DragonLessons from './features/DragonLessons';
import Grimoire from './features/Grimoire';
import OracleDeck from './features/OracleDeck';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsModal from './features/SettingsModal';
import Profile from './features/Profile';
import ChatInterface from './features/ChatInterface';
import Dashboard from './features/Dashboard';

import { useEffect, useRef } from 'react';
import { useDragonStore } from './logic/dragonStore';

// --- Notification Hook ---
const useNotifications = () => {
  const { dragons, activeEgg } = useDragonStore();
  const lastNotifiedRef = useRef<number>(0);

  useEffect(() => {
    // Request permission on mount
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    // Prevent spamming (Limit to once per 30 mins)
    if (now - lastNotifiedRef.current < 30 * 60 * 1000) return;

    if (Notification.permission !== 'granted') return;

    // 1. Check Hungry Dragon
    const starvingDragon = dragons.find(d => d.happiness < 30);
    if (starvingDragon) {
      new Notification("Elder Ignis", {
        body: `${starvingDragon.name} is growing weak from neglect... Return to the sanctuary!`,
        icon: '/dragon-icon.png' // Placeholder
      });
      lastNotifiedRef.current = now;
      return;
    }

    // 2. Check Egg Ready
    if (activeEgg?.isReadyToHatch) {
      new Notification("Elder Ignis", {
        body: "The Egg trembles! A new life is ready to emerge.",
        icon: '/egg-icon.png'
      });
      lastNotifiedRef.current = now;
    }

  }, [dragons, activeEgg]);
};

function App() {
  useNotifications(); // Activate Hook
  return (
    <Router>
      <div className="w-full h-screen text-slate-200 overflow-hidden font-sans relative">
        <SanctuaryLayout>
          <Routes>
            <Route path="/" element={<Sanctuary />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hatchery" element={<Hatchery />} />
            <Route path="/codex" element={<Codex />} />
            <Route path="/lessons" element={<DragonLessons />} />
            <Route path="/grimoire" element={<Grimoire />} />
            <Route path="/oracle" element={<OracleDeck />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/landing" element={<Landing />} />
          </Routes>
        </SanctuaryLayout>
        <SettingsModal />
        <ChatInterface />
      </div>
    </Router>
  );
}





export default App;
