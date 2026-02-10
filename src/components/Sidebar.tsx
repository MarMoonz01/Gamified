import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, ScrollText, Skull, Volume2, VolumeX, Sword, Map } from 'lucide-react';
import { useSound } from '../logic/soundStore';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
    const { playSound, isPlaying, toggleSound } = useSound();

    const navItems = [
        { path: '/dashboard', label: 'STATUS', icon: LayoutDashboard },
        { path: '/quests', label: 'QUESTS', icon: ScrollText },
        { path: '/dungeon', label: 'RAIDS', icon: Skull },
        { path: '/profile', label: 'HERO', icon: User },
        { path: '/world', label: 'MAP', icon: Map },
    ];

    return (
        <div className="h-full w-20 md:w-64 flex flex-col border-r-4 border-fantasy-gold-dim bg-fantasy-wood-dark text-fantasy-paper shadow-2xl relative z-50">
            {/* Logo Area */}
            <div className="p-6 border-b border-fantasy-gold-dim/30 flex items-center justify-center md:justify-start bg-black/20">
                <div className="w-10 h-10 bg-fantasy-gold rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_#ffd700] border-2 border-fantasy-wood">
                    <Sword size={20} className="text-fantasy-wood-dark rotate-45" />
                </div>
                <span className="hidden md:block ml-3 font-fantasy text-xl font-bold tracking-[0.1em] text-fantasy-gold text-shadow-sm">
                    GUILD
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 space-y-3 px-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => playSound('CLICK')}
                        onMouseEnter={() => playSound('HOVER')}
                        className={({ isActive }) => clsx(
                            "flex items-center p-3 rounded-md transition-all duration-300 group relative overflow-hidden border border-transparent",
                            isActive
                                ? "bg-fantasy-paper text-fantasy-wood-dark border-fantasy-gold shadow-[0_2px_10px_rgba(0,0,0,0.3)] transform scale-[1.02]"
                                : "text-fantasy-paper/60 hover:text-fantasy-gold hover:bg-white/5 hover:border-fantasy-gold/20"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={22} className={clsx("shrink-0 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                                <span className={clsx("hidden md:block ml-4 font-fantasy tracking-widest text-sm font-bold", isActive ? "text-fantasy-wood-dark" : "text-fantasy-paper/80")}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav-decoration"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-fantasy-gold"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Controls */}
            <div className="p-4 border-t border-fantasy-gold-dim/30 space-y-2 bg-black/20">
                <div className="mx-auto w-full h-[1px] bg-gradient-to-r from-transparent via-fantasy-gold-dim to-transparent mb-4 opacity-50"></div>
                <button
                    onClick={() => { toggleSound(); playSound('CLICK'); }}
                    className="w-full flex items-center justify-center md:justify-start p-2 text-fantasy-paper/50 hover:text-fantasy-gold transition-colors gap-3"
                >
                    {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    <span className="hidden md:block text-xs font-fantasy tracking-widest">
                        SOUND: {isPlaying ? 'ON' : 'OFF'}
                    </span>
                </button>

                <div className="hidden md:flex items-center gap-2 p-2 text-[10px] text-fantasy-gold/60 font-mono border border-fantasy-gold/10 rounded bg-black/20 justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" />
                    GUILD HALL: OPEN
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
