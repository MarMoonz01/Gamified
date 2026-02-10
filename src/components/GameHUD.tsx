import React, { useState } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import { useSound } from '../logic/soundStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Map as MapIcon, Home, User, ShoppingBag, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const GameHUD: React.FC = () => {
    const { hero: stats, gold } = useDragonStore(); // Destructure hero as stats to match existing usage
    const { level, xp } = stats; // Extract level and xp from stats (hero)
    const { playSound } = useSound();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Don't show HUD on the landing page if you have one, but for now we show it everywhere authenticated

    const menuItems = [
        { label: 'World Map', icon: MapIcon, path: '/' },
        { label: 'Guild (Dashboard)', icon: Home, path: '/guild' },
        { label: 'Character', icon: User, path: '/profile' },
        { label: 'Shop', icon: ShoppingBag, path: '/shop' },
    ];

    return (
        <>
            {/* TOP LEFT: Status Bars */}
            <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
                {/* Level Badge */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black/80 border-2 border-fantasy-gold rounded-full flex items-center justify-center relative shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                        <span className="text-fantasy-gold font-bold font-medieval text-xl">{level}</span>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-fantasy-wood flex items-center justify-center rounded-full border border-fantasy-gold text-[10px] text-white font-mono">
                            LV
                        </div>
                    </div>

                    {/* Bars Container */}
                    <div className="flex flex-col gap-1 w-48">
                        {/* HP Bar */}
                        <div className="h-3 bg-black/50 rounded-full border border-red-900/50 relative overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-900 to-red-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-white/80 font-bold tracking-widest">
                                {stats.hp} / {stats.maxHp} HP
                            </div>
                        </div>

                        {/* MP Bar */}
                        <div className="h-3 bg-black/50 rounded-full border border-blue-900/50 relative overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-900 to-blue-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.mp / stats.maxMp) * 100}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-white/80 font-bold tracking-widest">
                                {stats.mp} / {stats.maxMp} MP
                            </div>
                        </div>

                        {/* XP Bar */}
                        <div className="h-1 bg-black/50 rounded-full border border-yellow-900/30 relative overflow-hidden mt-1">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-fantasy-gold"
                                initial={{ width: 0 }}
                                animate={{ width: `${xp}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* TOP RIGHT: Menu & Gold */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-4 pointer-events-auto">
                <div className="px-4 py-2 bg-black/80 border border-fantasy-gold/50 rounded-lg flex items-center gap-2 text-fantasy-gold font-mono font-bold shadow-lg">
                    <span className="text-yellow-400">G</span>
                    <span>{gold}</span>
                </div>

                <button
                    onClick={() => {
                        setIsMenuOpen(true);
                        playSound('MENU_OPEN');
                    }}
                    className="p-3 bg-fantasy-wood hover:bg-fantasy-wood-dark border-2 border-fantasy-gold rounded-lg text-fantasy-gold transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Full Screen Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 backdrop-blur-sm"
                    >
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                playSound('CLICK');
                            }}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="w-full max-w-lg flex flex-col gap-4">
                            <h2 className="text-4xl font-medieval text-fantasy-gold text-center mb-8 tracking-widest border-b border-fantasy-gold/30 pb-4">
                                SYSTEM MENU
                            </h2>

                            {menuItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        playSound('CLICK');
                                        navigate(item.path);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`
                                        group flex items-center gap-4 p-4 border-2 rounded-lg transition-all
                                        ${location.pathname === item.path
                                            ? 'bg-fantasy-gold/10 border-fantasy-gold text-fantasy-gold'
                                            : 'bg-fantasy-wood/10 border-white/10 text-gray-400 hover:bg-fantasy-wood/30 hover:border-fantasy-gold/50 hover:text-white'}
                                    `}
                                >
                                    <div className={`p-2 rounded bg-black/50 group-hover:bg-fantasy-gold/20 transition-colors`}>
                                        <item.icon size={24} />
                                    </div>
                                    <span className="text-xl font-medieval tracking-wider">{item.label}</span>
                                </button>
                            ))}

                            <button
                                className="mt-8 flex items-center justify-center gap-2 p-4 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-900/50"
                            >
                                <LogOut size={20} />
                                <span className="font-mono text-sm uppercase tracking-widest">Jack Out (Exit)</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GameHUD;
