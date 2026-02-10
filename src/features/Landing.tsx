import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Power, Terminal, ShieldAlert } from 'lucide-react';
import GlitchText from '../components/effects/GlitchText';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [isBooting, setIsBooting] = useState(false);

    const handleStart = () => {
        setIsBooting(true);
        // Simulate boot sequence
        setTimeout(() => {
            navigate('/dashboard');
        }, 2000);
    };

    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden font-mono text-blue-500 selection:bg-blue-500 selection:text-black">

            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full p-8">

                {/* ID / Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="mb-12 relative"
                >
                    <div className="w-32 h-32 border-4 border-blue-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)] animate-pulse">
                        <Terminal size={64} className="text-blue-400" />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl md:text-7xl font-header tracking-widest text-center mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                >
                    <GlitchText text="SHADOW" className="mr-4 text-white" />
                    <GlitchText text="OS" className="text-blue-500" colors={['text-blue-500', 'text-white']} />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-blue-400/80 tracking-[0.5em] text-sm mb-12"
                >
                    SYSTEM VERSION 2.0 // ONLINE
                </motion.p>

                {/* Status Log (Decorative) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="w-full max-w-md bg-blue-900/10 border border-blue-500/20 p-4 rounded mb-12 font-mono text-xs text-blue-300 space-y-1"
                >
                    <div className="flex justify-between"><span>&gt; CORE_LOGIC</span><span className="text-green-400">OK</span></div>
                    <div className="flex justify-between"><span>&gt; SHADOW_ARMY</span><span className="text-green-400">STANDBY</span></div>
                    <div className="flex justify-between"><span>&gt; DUNGEON_GATES</span><span className="text-yellow-400">DETECTED</span></div>
                    <div className="flex justify-between"><span>&gt; PLAYER_SYNC</span><span className="animate-pulse">WAITING...</span></div>
                </motion.div>

                {/* Start Button */}
                {!isBooting ? (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                        onClick={handleStart}
                        className="group relative px-8 py-4 bg-transparent border-2 border-blue-500 text-blue-400 font-header tracking-widest text-xl hover:bg-blue-500 hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)]"
                    >
                        <span className="flex items-center gap-3">
                            <Power size={24} />
                            INITIALIZE SYSTEM
                        </span>
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-blue-400 font-mono tracking-widest animate-pulse"
                    >
                        ACCESSING MAINFRAME...
                    </motion.div>
                )}

            </div>

            {/* Footer Warning */}
            <div className="absolute bottom-6 flex items-center gap-2 text-red-500/50 text-[10px] uppercase tracking-widest">
                <ShieldAlert size={12} />
                Authorized Personnel Only // Class S Clearance Output
            </div>

        </div>
    );
};

export default Landing;
