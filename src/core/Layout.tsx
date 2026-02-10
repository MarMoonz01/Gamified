import React from 'react';
import GameHUD from '../components/GameHUD';
import ClickSpark from '../components/effects/ClickSpark';
import LevelUpModal from '../components/LevelUpModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-black text-white relative font-sans select-none">
            <ClickSpark />

            {/* New Game HUD (Overlay) */}
            <GameHUD />

            {/* Main Game Viewport */}
            <main className="flex-1 relative overflow-hidden h-full w-full">
                {/* Vignette Effect for immersion */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-40"></div>

                {/* Scrollable Content Container */}
                <div className="h-full w-full overflow-y-auto no-scrollbar">
                    {children}
                </div>
            </main>

            {/* Global Modals */}
            <LevelUpModal />
        </div>
    );
};

export default Layout;
