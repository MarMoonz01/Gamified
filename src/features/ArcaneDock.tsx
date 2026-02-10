import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Feather,
    BookOpen,
    Sparkles,
    Scroll,
    Map
} from 'lucide-react';
import { motion } from 'framer-motion';

const DockItem: React.FC<{
    icon: any,
    label: string,
    path: string,
    active: boolean,
    onClick: () => void,
    special?: boolean
}> = ({ icon: Icon, label, active, onClick, special }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.15, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`
                group relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all cursor-pointer shadow-lg
                ${active ? 'bg-[#D4AF37] text-[#2C1810] shadow-[0_0_25px_rgba(212,175,55,0.6)] z-10' : 'bg-[#1a0b0e] text-[#D7C4A1] hover:bg-[#3E2723] hover:shadow-[0_0_15px_rgba(215,196,161,0.3)]'}
                ${special ? 'border-2 border-purple-500/50' : 'border-2 border-[#5D4037]'}
            `}
        >
            <Icon size={32} className={special && !active ? "text-purple-400" : ""} />

            {/* Tooltip */}
            <span className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform bg-[#2C1810] text-[#D4AF37] text-sm font-bold px-3 py-1 pb-1.5 rounded-lg border border-[#D4AF37] pointer-events-none whitespace-nowrap shadow-xl z-50 font-medieval tracking-widest">
                {label}
            </span>

            {/* Active Indicator Rune */}
            {active && (
                <div className="absolute -bottom-3 w-2 h-2 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]" />
            )}
        </motion.button>
    );
};

const ArcaneDock: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
            {/* Dock Container */}
            <div className="
                flex items-end gap-2 px-6 py-4
                bg-[#2C1810]/90 backdrop-blur-md 
                border-2 border-[#D4AF37]/50 border-t-[#D4AF37]
                rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]
                relative
            ">
                {/* Decorative End Caps */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#D4AF37] rounded-full border-2 border-[#2C1810] -z-10" />
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#D4AF37] rounded-full border-2 border-[#2C1810] -z-10" />

                <DockItem
                    icon={Map}
                    label="Sanctuary"
                    path="/"
                    active={location.pathname === '/'}
                    onClick={() => navigate('/')}
                />
                <DockItem
                    icon={Feather}
                    label="Hatchery"
                    path="/hatchery"
                    active={location.pathname === '/hatchery'}
                    onClick={() => navigate('/hatchery')}
                />
                <DockItem
                    icon={BookOpen}
                    label="Grimoire"
                    path="/grimoire"
                    active={location.pathname === '/grimoire'}
                    onClick={() => navigate('/grimoire')}
                />
                <div className="w-px h-12 bg-[#5D4037]/50 mx-4" /> {/* Divider */}
                <DockItem
                    icon={Sparkles}
                    label="Oracle"
                    path="/oracle"
                    active={location.pathname === '/oracle'}
                    onClick={() => navigate('/oracle')}
                    special
                />
                <DockItem
                    icon={Scroll}
                    label="Academy"
                    path="/lessons"
                    active={location.pathname === '/lessons'}
                    onClick={() => navigate('/lessons')}
                />
            </div>
        </div>
    );
};

export default ArcaneDock;
