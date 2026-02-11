import React from 'react';
import { useDragonStore } from '../logic/dragonStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Egg, Home, User, Zap, CircleDollarSign, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SanctuaryLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { essence, gold } = useDragonStore();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="w-screen h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans flex flex-col">

            {/* --- Header --- */}
            <header className="px-6 py-4 flex justify-between items-center z-50">
                <div onClick={() => navigate('/profile')} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 group-hover:bg-slate-300 transition-colors">
                        DK
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900">Dragon Keeper</h1>
                        <p className="text-xs text-slate-500">Level 1</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                        <Zap size={14} className="text-blue-500" />
                        <span className="text-sm font-semibold">{essence}</span>
                    </div>
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                        <CircleDollarSign size={14} className="text-amber-500" />
                        <span className="text-sm font-semibold">{gold}</span>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="flex-1 relative overflow-hidden bg-white m-4 mt-0 rounded-2xl border border-slate-200 shadow-sm">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full overflow-y-auto custom-scrollbar p-6"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* --- Bottom Navigation --- */}
            <nav className="pb-6 pt-2 flex justify-center z-50">
                <div className="bg-white border border-slate-200 px-6 py-3 rounded-full shadow-lg flex items-center gap-8">
                    <NavButton icon={Home} label="Home" active={location.pathname === '/'} onClick={() => navigate('/')} />
                    <NavButton icon={Egg} label="Hatchery" active={location.pathname === '/hatchery'} onClick={() => navigate('/hatchery')} />
                    <NavButton icon={LayoutGrid} label="Dashboard" active={location.pathname === '/dashboard'} onClick={() => navigate('/dashboard')} />
                    <NavButton icon={BookOpen} label="Grimoire" active={location.pathname === '/grimoire'} onClick={() => navigate('/grimoire')} />
                    <NavButton icon={User} label="Profile" active={location.pathname === '/profile'} onClick={() => navigate('/profile')} />
                </div>
            </nav>
        </div>
    );
};

const NavButton: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default SanctuaryLayout;
