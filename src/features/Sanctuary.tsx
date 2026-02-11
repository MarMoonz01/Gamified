import React, { useState, useMemo } from 'react';
import { useDragonStore, type Dragon } from '../logic/dragonStore';
import { motion, AnimatePresence } from 'framer-motion';
import PixelDragon from '../components/PixelDragon';
import { Sparkles, X, Crown, Zap, Shield, Scroll, Star, Utensils, Dumbbell } from 'lucide-react';
import clsx from 'clsx';

const Sanctuary: React.FC = () => {
    const { dragons, activeDragonId, setActiveDragon } = useDragonStore();
    const [selectedDragon, setSelectedDragon] = useState<Dragon | null>(null);

    return (
        <div className="w-full h-full relative overflow-hidden bg-sky-50 font-sans">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-100 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl"></div>
            </div>

            {/* The Island (Visual) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none translate-y-20">
                <div className="relative">
                    <div className="w-[600px] h-[300px] bg-[#81C784] rounded-[50%] blur-sm opacity-90 border-t-8 border-[#A5D6A7] shadow-xl relative z-10" />
                    <div className="absolute top-10 left-10 w-[580px] h-[300px] bg-[#388E3C] rounded-[50%] -z-0 opacity-50 blur-md transform translate-y-4" />
                </div>
            </div>

            {/* Dragons Roaming */}
            <div className="relative w-full h-full z-10">
                {dragons.length === 0 ? (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-sky-800/60 font-medieval">
                        <h2 className="text-3xl mb-2">The Sanctuary is quiet...</h2>
                        <span className="text-sm font-sans text-slate-500">Visit the Hatchery to start your journey.</span>
                    </div>
                ) : (
                    dragons.map((dragon, index) => (
                        <DragonSprite
                            key={dragon.id}
                            dragon={dragon}
                            index={index}
                            onClick={() => setSelectedDragon(dragon)}
                            isActive={activeDragonId === dragon.id}
                        />
                    ))
                )}
            </div>

            {/* Dragon Arcana Card Modal */}
            <AnimatePresence>
                {selectedDragon && (
                    <DragonArcanaCard
                        dragon={selectedDragon}
                        onClose={() => setSelectedDragon(null)}
                        onEquip={() => setActiveDragon(selectedDragon.id)}
                        isActive={activeDragonId === selectedDragon.id}
                        essence={useDragonStore.getState().essence} // Direct access for now, or better use hook in parent
                        feedDragon={useDragonStore.getState().feedDragon}
                        trainDragon={useDragonStore.getState().trainDragon}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Dragon Sprite Component ---
const DragonSprite: React.FC<{ dragon: Dragon, index: number, onClick: () => void, isActive: boolean }> = ({ dragon, index, onClick, isActive }) => {
    const randomX = useMemo(() => Math.random() * 40 + 30, []);
    const randomY = useMemo(() => Math.random() * 30 + 35, []);

    return (
        <motion.div
            className="absolute flex flex-col items-center cursor-pointer group z-20"
            style={{ left: `${randomX}%`, top: `${randomY}%` }}
            animate={{
                y: [0, -10, 0],
                x: [0, 5, 0]
            }}
            transition={{
                duration: 4 + index,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5
            }}
            whileHover={{ scale: 1.1, zIndex: 30 }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {isActive && (
                <div className="absolute -top-6 text-[#D4AF37] animate-bounce">
                    <Crown size={20} fill="currentColor" />
                </div>
            )}

            <div className={`relative w-16 h-16 rounded-full shadow-lg border-2 flex items-center justify-center
                ${dragon.type === 'FIRE' ? 'bg-orange-400/20 border-orange-300' :
                    dragon.type === 'WATER' ? 'bg-blue-400/20 border-blue-300' :
                        dragon.type === 'WIND' ? 'bg-yellow-200/20 border-yellow-300' :
                            dragon.type === 'TERRA' ? 'bg-emerald-600/20 border-emerald-300' : 'bg-purple-500/20 border-purple-300'
                } backdrop-blur-sm transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]`}
            >
                <PixelDragon dna={dragon.dna} size={4} />
            </div>

            <div className="mt-2 px-3 py-1 bg-white/90 backdrop-blur rounded-full shadow-sm text-xs font-bold text-sky-900 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 pointer-events-none border border-white/50 whitespace-nowrap z-30">
                {dragon.name}
            </div>
        </motion.div>
    );
};

// --- Arcana Card Component ---
interface DragonArcanaProps {
    dragon: Dragon;
    onClose: () => void;
    onEquip: () => void;
    isActive: boolean;
    essence: number;
    feedDragon: (id: string, amount: number) => void;
    trainDragon: (id: string, type: 'STRENGTH' | 'WISDOM' | 'CHARISMA') => void;
}

const DragonArcanaCard: React.FC<DragonArcanaProps> = ({ dragon, onClose, onEquip, isActive, essence, feedDragon, trainDragon }) => {

    const getArcanaTitle = (type: string) => {
        switch (type) {
            case 'FIRE': return "The Emperor";
            case 'WATER': return "The Moon";
            case 'WIND': return "The Fool";
            case 'TERRA': return "The Empress";
            case 'ARCANE': return "The Magician";
            case 'RADIANT': return "The Sun";
            default: return "The World";
        }
    };

    const getThemeColor = (type: string) => {
        switch (type) {
            case 'FIRE': return "from-orange-900 via-red-800 to-orange-900 border-orange-500 text-orange-200";
            case 'WATER': return "from-blue-900 via-indigo-900 to-blue-900 border-blue-400 text-blue-200";
            case 'WIND': return "from-slate-800 via-teal-900 to-slate-800 border-teal-400 text-teal-200";
            case 'TERRA': return "from-green-900 via-emerald-900 to-green-900 border-emerald-500 text-emerald-200";
            default: return "from-purple-900 via-fuchsia-900 to-purple-900 border-purple-400 text-purple-200";
        }
    };

    const theme = getThemeColor(dragon.type);
    const arcana = getArcanaTitle(dragon.type);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ rotateY: 90, scale: 0.8 }}
                animate={{ rotateY: 0, scale: 1 }}
                exit={{ rotateY: -90, scale: 0.8 }}
                transition={{ type: "spring", damping: 20 }}
                className={clsx(
                    "w-[350px] h-[550px] rounded-xl relative overflow-hidden shadow-2xl border-[6px]",
                    theme.split(' ')[3] // Border color
                )}
                onClick={e => e.stopPropagation()}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Mystic Background */}
                <div className={clsx("absolute inset-0 bg-gradient-to-br", theme.split(' ').slice(0, 3).join(' '))}>
                    {/* Stars/Dust */}
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />
                </div>

                {/* Card Content Container */}
                <div className="relative h-full flex flex-col items-center p-6 text-center z-10">

                    {/* Header: Roman Numerals & Arcana Name */}
                    <div className="mb-2 w-full border-b border-white/20 pb-2">
                        <span className="block text-xs font-serif opacity-70 tracking-[0.2em] mb-1">ARCANA {['I', 'II', 'III', 'IV', 'V', 'VI'][Math.floor(Math.random() * 6)]}</span>
                        <h2 className={clsx("text-2xl font-medieval font-bold uppercase tracking-wider drop-shadow-lg", theme.split(' ').pop())}>
                            {arcana}
                        </h2>
                    </div>

                    {/* Dragon Illustration Area */}
                    <div className="flex-1 w-full flex items-center justify-center relative my-4">
                        {/* Glowing Halo */}
                        <div className="absolute w-40 h-40 rounded-full bg-white/10 blur-2xl animate-pulse" />
                        <div className="relative z-10 transform scale-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                            <PixelDragon dna={dragon.dna} size={8} />
                        </div>
                    </div>

                    {/* Dragon Name & Type */}
                    <div className="w-full bg-black/40 backdrop-blur-md rounded-lg p-4 border border-white/10 mb-4">
                        <h3 className="text-xl font-bold text-white mb-1 font-serif">{dragon.name}</h3>
                        <div className="flex justify-center gap-4 text-xs font-mono opacity-80 uppercase tracking-widest text-white/70">
                            <span className="flex items-center gap-1"><Zap size={10} /> Lvl {dragon.level}</span>
                            <span className="flex items-center gap-1"><Sparkles size={10} /> {dragon.type}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="w-full grid grid-cols-3 gap-2 mb-6">
                        <StatBox label="STR" value={dragon.stats.strength} icon={<Shield size={12} />} />
                        <StatBox label="WIS" value={dragon.stats.wisdom} icon={<Scroll size={12} />} />
                        <StatBox label="CHA" value={dragon.stats.charisma} icon={<Star size={12} />} />
                    </div>

                    {/* Actions Grid */}
                    <div className="w-full grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); feedDragon(dragon.id, 20); }}
                            disabled={essence < 20}
                            className={clsx(
                                "border rounded-lg p-2 flex flex-col items-center gap-1 transition-all group relative overflow-hidden",
                                essence >= 20
                                    ? "bg-rose-500/20 hover:bg-rose-500/40 border-rose-500/50 cursor-pointer"
                                    : "bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed"
                            )}
                            title="Feed: -20 Essence, +XP, +Happiness"
                        >
                            <Utensils size={16} className={clsx("transition-transform", essence >= 20 ? "text-rose-300 group-hover:scale-110" : "text-gray-500")} />
                            <span className={clsx("text-[10px] uppercase font-bold", essence >= 20 ? "text-rose-100" : "text-gray-500")}>Feed (20)</span>
                            {essence < 20 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-red-300 font-bold">Need Essence</div>}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); trainDragon(dragon.id, 'STRENGTH'); }}
                            disabled={essence < 20}
                            className={clsx(
                                "border rounded-lg p-2 flex flex-col items-center gap-1 transition-all group relative overflow-hidden",
                                essence >= 20
                                    ? "bg-amber-500/20 hover:bg-amber-500/40 border-amber-500/50 cursor-pointer"
                                    : "bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed"
                            )}
                            title="Train: -20 Essence, +Stats, +XP, -Happiness"
                        >
                            <Dumbbell size={16} className={clsx("transition-transform", essence >= 20 ? "text-amber-300 group-hover:scale-110" : "text-gray-500")} />
                            <span className={clsx("text-[10px] uppercase font-bold", essence >= 20 ? "text-amber-100" : "text-gray-500")}>Train (20)</span>
                            {essence < 20 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-red-300 font-bold">Need Essence</div>}
                        </button>
                    </div>

                    {/* Footer / Actions */}
                    <div className="w-full mt-auto">
                        {isActive ? (
                            <div className="flex items-center justify-center gap-2 text-[#D4AF37] font-medieval text-sm py-2 px-4 bg-black/50 rounded border border-[#D4AF37]/50">
                                <Crown size={16} fill="currentColor" /> Active Companion
                            </div>
                        ) : (
                            <button
                                onClick={onEquip}
                                className={clsx(
                                    "w-full py-2 rounded font-bold uppercase tracking-widest text-xs transition-all",
                                    "bg-white/10 hover:bg-white/20 border border-white/30 text-white shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                )}
                            >
                                Invoke Spirit
                            </button>
                        )}
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 text-white/50 hover:text-white transition-colors z-50"
                >
                    <X size={20} />
                </button>
            </motion.div>
        </motion.div>
    );
};

const StatBox = ({ label, value, icon }: any) => (
    <div className="flex flex-col items-center bg-white/5 rounded p-2 border border-white/10">
        <span className="text-white/40 mb-1">{icon}</span>
        <span className="text-white font-bold text-lg">{value}</span>
        <span className="text-[9px] uppercase tracking-widest text-white/40">{label}</span>
    </div>
);

export default Sanctuary;
