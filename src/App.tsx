import SanctuaryLayout from './core/SanctuaryLayout';
import Landing from './features/Landing';
import Sanctuary from './features/Sanctuary';
import Hatchery from './features/Hatchery';
import Codex from './features/Codex';
// import DragonLessons from './features/DragonLessons'; // Deprecated
import Grimoire from './features/Grimoire';
import OracleDeck from './features/OracleDeck';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsModal from './features/SettingsModal';
import Profile from './features/Profile';
import ChatInterface from './features/ChatInterface';
import Dashboard from './features/Dashboard';
import Analysis from './features/Analysis';
import Achievements from './features/Achievements';
import GuildShop from './features/GuildShop';
import Academy from './features/Academy';
import HallOfRecords from './features/HallOfRecordsComponent'; // Import updated
import WritingDojo from './features/dojos/WritingDojo';
import SpeakingDojo from './features/dojos/SpeakingDojo';
import ReadingDojo from './features/dojos/ReadingDojo';
import ListeningDojo from './features/dojos/ListeningDojo';

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
        icon: '/vite.svg'
      });
      lastNotifiedRef.current = now;
      return;
    }

    // 2. Check Egg Ready
    if (activeEgg?.isReadyToHatch) {
      new Notification("Elder Ignis", {
        body: "The Egg trembles! A new life is ready to emerge.",
        icon: '/vite.svg'
      });
      lastNotifiedRef.current = now;
    }
  }, [dragons, activeEgg]);

  const { checkDailyReset } = useDragonStore();
  useEffect(() => {
    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(interval);
  }, [checkDailyReset]);
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
            <Route path="/academy" element={<Academy />} />
            <Route path="/lessons" element={<Academy />} />
            <Route path="/dojo/writing" element={<WritingDojo onBack={() => window.location.href = '/lessons'} />} />
            <Route path="/dojo/speaking" element={<SpeakingDojo onBack={() => window.location.href = '/lessons'} />} />
            <Route path="/dojo/reading" element={<ReadingDojo onBack={() => window.location.href = '/lessons'} />} />
            <Route path="/dojo/listening" element={<ListeningDojo onBack={() => window.location.href = '/lessons'} />} />
            <Route path="/hall-of-records" element={<HallOfRecords />} />
            <Route path="/grimoire" element={<Grimoire />} />
            <Route path="/oracle" element={<OracleDeck />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/shop" element={<GuildShop />} />
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
