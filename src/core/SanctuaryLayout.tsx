import React, { useState, useEffect } from 'react';
import { useDragonStore } from '../logic/dragonStore'; // Re-added import
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sun, Moon, Settings, BookOpen, Feather, Sparkles } from 'lucide-react'; // Re-added imports
import { useNavigate } from 'react-router-dom'; // Re-added import

const SanctuaryLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { essence, gold } = useDragonStore(); // Re-added hook
    const navigate = useNavigate();

    // Day/Night Cycle
    const [isDay, setIsDay] = useState(true);

    useEffect(() => {
        const hour = new Date().getHours();
        setIsDay(hour > 6 && hour < 18);
    }, []);

    const toggleTime = () => setIsDay(!isDay);

    return (
        <div className={`relative w-screen h-screen overflow-hidden transition-colors duration-1000 ${isDay ? 'bg-sky-100' : 'bg-indigo-950'}`}>

            {/* --- Dynamic Background --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Global Noise Texture Overlay */}
                <div className="absolute inset-0 z-50 opacity-[0.03] pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Vignette */}
                <div className="absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

                {isDay ? (
                    <>
                        {/* Day: Golden Hour / Mythic Dawn */}
                        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-amber-200 via-orange-100 to-sky-200" />

                        <motion.div
                            className="absolute top-10 right-20 text-amber-500/80 mix-blend-overlay"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 8 }}
                        >
                            <Sun size={120} fill="currentColor" className="blur-sm" />
                        </motion.div>

                        {/* Clouds - Soft & Wispy */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-white/40 blur-md"
                                style={{ top: `${20 + i * 15}%`, left: '-10%' }}
                                animate={{ x: ['-10vw', '110vw'] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 40 + i * 10,
                                    ease: "linear",
                                    delay: i * 5
                                }}
                            >
                                <Cloud size={100 + i * 40} fill="currentColor" />
                            </motion.div>
                        ))}
                    </>
                ) : (
                    <>
                        {/* Night: Deep Astral Void */}
                        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-[#0F172A] via-[#312E81] to-[#4C1D95]" />

                        <motion.div
                            className="absolute top-10 right-20 text-purple-200"
                            animate={{ rotate: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 12 }}
                        >
                            <Moon size={80} fill="currentColor" className="drop-shadow-[0_0_30px_rgba(255,255,255,0.6)] blur-[1px]" />
                        </motion.div>

                        {/* Stars & Nebulae */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(76,29,149,0.3)_0%,transparent_70%)]" />
                        {[...Array(40)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute bg-white rounded-full"
                                style={{
                                    width: Math.random() * 3 + 'px',
                                    height: Math.random() * 3 + 'px',
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                }}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* --- Floating Islands (Decoration) --- */}
            <div className="absolute bottom-0 w-full h-32 bg-emerald-500/20 backdrop-blur-sm z-0 skew-y-3 origin-bottom-left" />

            {/* --- Top HUD --- */}
            <div className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-start pointer-events-none">
                {/* Profile / Level - Pointer Events Auto for interactivity */}
                <div
                    onClick={() => navigate('/profile')}
                    className="pointer-events-auto bg-[#FDF6E3] border-2 border-[#5D4037] px-4 py-2 flex items-center gap-4 cursor-pointer hover:bg-[#FFF8E1] transition-colors shadow-lg rounded-sm"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#D4AF37] shadow-lg flex items-center justify-center font-bold text-[#D4AF37] font-medieval">
                        DK
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#5D4037] uppercase tracking-widest">Master Keeper</span>
                        <div className="w-24 h-2 bg-[#D7C4A1] rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-[#D4AF37] w-2/3" />
                        </div>
                    </div>
                </div>

                {/* Resources */}
                <div className="flex gap-4 pointer-events-auto">
                    <div className="bg-[#FDF6E3] border-2 border-[#5D4037] px-4 py-2 flex items-center gap-2 text-[#5D4037] font-bold shadow-lg rounded-sm">
                        <Feather size={18} className="text-dragon-fire" />
                        <span>{essence}</span>
                    </div>
                    <div className="bg-[#FDF6E3] border-2 border-[#5D4037] px-4 py-2 flex items-center gap-2 text-[#5D4037] font-bold shadow-lg rounded-sm">
                        <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600" />
                        <span>{gold}</span>
                    </div>
                    <button onClick={toggleTime} className="bg-[#FDF6E3] border-2 border-[#5D4037] p-2 hover:bg-[#FFF8E1] transition-colors text-[#5D4037] shadow-lg rounded-sm">
                        {isDay ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button className="bg-[#FDF6E3] border-2 border-[#5D4037] p-2 hover:bg-[#FFF8E1] transition-colors text-[#5D4037] shadow-lg rounded-sm">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <main className="relative z-10 w-full h-full flex pt-24 pb-24 px-6 gap-6">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={isDay ? 'day' : 'night'} // Key change triggers generic fade for now, ideally use location.pathname
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* --- Bottom Nav --- */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2C1810] border-2 border-[#D4AF37] px-6 py-3 flex gap-8 rounded-full shadow-2xl">
                <NavButton icon={BookOpen} label="Codex" onClick={() => navigate('/codex')} />
                <NavButton icon={Cloud} label="Sanctuary" onClick={() => navigate('/')} active />
                <NavButton icon={Feather} label="Hatchery" onClick={() => navigate('/hatchery')} />
                <NavButton icon={BookOpen} label="Grimoire" onClick={() => navigate('/grimoire')} />
                <NavButton icon={Sparkles} label="Oracle" onClick={() => navigate('/oracle')} />
                <NavButton icon={BookOpen} label="Academy" onClick={() => navigate('/lessons')} />
            </div>
        </div>
    );
};

const NavButton: React.FC<{ icon: any, label: string, onClick?: () => void, active?: boolean }> = ({ icon: Icon, label, onClick, active }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 transition-all hover:-translate-y-1 ${active ? 'text-[#D4AF37] scale-110' : 'text-[#8D6E63] hover:text-[#D7C4A1]'}`}
    >
        <Icon size={24} fill={active ? "currentColor" : "none"} />
        <span className="text-[10px] font-bold uppercase tracking-wider font-medieval">{label}</span>
    </button>
);

export default SanctuaryLayout;
