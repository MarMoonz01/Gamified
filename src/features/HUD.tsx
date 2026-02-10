import React from 'react';
import { useDragonStore } from '../logic/dragonStore';
import { Feather, Sun, Moon, Settings, Database, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

const HUD: React.FC<{ isDay: boolean; toggleTime: () => void }> = ({ isDay, toggleTime }) => {
    const { essence, gold, dragonInk, playerName, dragons } = useDragonStore();

    // Calculate total level
    const totalLevel = dragons.reduce((acc, curr) => acc + curr.level, 0);
    const title = totalLevel > 50 ? "Grand Archon" : totalLevel > 20 ? "Dragon Master" : "Novice Tamer";

    return (
        <div className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-start pointer-events-none select-none">

            {/* --- Tamer Crest (Profile) --- */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="pointer-events-auto group relative cursor-pointer"
            >
                <div className="absolute -inset-2 bg-[#D4AF37]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="bg-[#2C1810] border-2 border-[#D4AF37] p-2 pr-6 rounded-l-full rounded-r-lg shadow-2xl flex items-center gap-4 relative overflow-hidden">
                    {/* Level Badge */}
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-[#D4AF37] flex items-center justify-center shadow-inner z-10 relative">
                            <span className="font-medieval text-[#D4AF37] text-xl font-bold">{Math.floor(totalLevel / 5) + 1}</span>
                        </div>
                        {/* Ring */}
                        <div className="absolute -inset-1 border border-[#D4AF37]/50 rounded-full animate-spin-slow" style={{ animationDuration: '10s' }} />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col z-10">
                        <h2 className="font-medieval text-lg text-[#FDF6E3] tracking-wide text-glow">{playerName || "Traveler"}</h2>
                        <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold">{title}</span>

                        {/* XP Bar (Cosmetic for Player) */}
                        <div className="w-24 h-1.5 bg-black/50 rounded-full mt-1 overflow-hidden border border-[#5D4037]">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FDB931]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(totalLevel % 5) * 20}%` }}
                            />
                        </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 mask-linear-fade" />
                </div>
            </motion.div>

            {/* --- Resource Bars --- */}
            <div className="flex gap-6 pointer-events-auto items-center">

                {/* Essence Bar */}
                <ResourceBar
                    icon={Feather}
                    value={essence}
                    max={500}
                    color="from-orange-500 to-red-500"
                    label="Essence"
                />

                {/* Gold Counter */}
                <ResourceBar
                    icon={Database}
                    value={gold}
                    max={1000}
                    color="from-yellow-400 to-amber-600"
                    label="Gold"
                />

                {/* Ink Vial */}
                <ResourceBar
                    icon={Droplet}
                    value={dragonInk}
                    max={20}
                    color="from-purple-500 to-indigo-600"
                    label="Ink"
                />

                <div className="w-px h-10 bg-[#5D4037]/50 mx-2" />

                {/* System Controls */}
                <div className="flex gap-3">
                    <ControlButton onClick={toggleTime}>
                        {isDay ? <Moon size={20} className="text-indigo-200" /> : <Sun size={20} className="text-amber-200" />}
                    </ControlButton>
                    <ControlButton>
                        <Settings size={20} className="text-[#D7C4A1]" />
                    </ControlButton>
                </div>
            </div>
        </div>
    );
};

const ResourceBar: React.FC<{ icon: any, value: number, max: number, color: string, label: string }> = ({ icon: Icon, value, max, color, label }) => {
    // Percentage for bar width
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className="flex flex-col items-center gap-1 group">
            <div className="relative bg-[#2C1810] border-2 border-[#5D4037] p-1 px-3 rounded-lg shadow-xl min-w-[100px] flex flex-col justify-center overflow-hidden">
                {/* Animated Fill */}
                <motion.div
                    className={`absolute inset-0 opacity-30 bg-gradient-to-r ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: "spring", damping: 20 }}
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                    <Icon size={16} className="text-[#D4AF37]" />
                    <span className="font-medieval text-[#FDF6E3] text-lg font-bold">{value}</span>
                </div>
            </div>
            <span className="text-[9px] text-[#5D4037] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                {label}
            </span>
        </div>
    );
};

const ControlButton: React.FC<{ children: React.ReactNode, onClick?: () => void }> = ({ children, onClick }) => (
    <button
        onClick={onClick}
        className="w-10 h-10 bg-[#2C1810] border-2 border-[#5D4037] rounded-full flex items-center justify-center hover:scale-110 hover:border-[#D4AF37] transition-all shadow-lg active:scale-95"
    >
        {children}
    </button>
);

export default HUD;
