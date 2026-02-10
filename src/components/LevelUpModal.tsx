import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragonStore } from '../logic/dragonStore';
import { ChevronUp, Zap } from 'lucide-react';
import LevelUpParticles from './effects/LevelUpParticles';

const LevelUpModal: React.FC = () => {
    const level = useDragonStore(state => state.hero.level);
    const [show, setShow] = useState(false);
    const [prevLevel, setPrevLevel] = useState(level);

    useEffect(() => {
        if (level > prevLevel) {
            setShow(true);
            setPrevLevel(level);
        }
    }, [level, prevLevel]);

    const handleClose = () => setShow(false);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={handleClose}>
                    <LevelUpParticles />
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: -50 }}
                        className="bg-black border-2 border-yellow-500 p-8 rounded-lg max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.5)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex justify-center mb-4"
                        >
                            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-[0_0_20px_#eab308]">
                                <ChevronUp size={48} className="text-yellow-400" />
                            </div>
                        </motion.div>

                        <h2 className="text-5xl font-header text-yellow-500 tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">
                            LEVEL UP!
                        </h2>

                        <div className="text-2xl font-mono text-white mb-6">
                            LEVEL {level - 1} <span className="text-yellow-500 mx-2">➞</span> LEVEL {level}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 text-left bg-white/5 p-4 rounded border border-white/10">
                            <div className="flex items-center gap-2">
                                <Zap size={16} className="text-blue-400" />
                                <span className="text-sm text-gray-400 font-mono">MP RESTORED</span>
                            </div>
                            <div className="text-right text-blue-400 font-bold">100%</div>

                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50 flex items-center justify-center text-[10px] text-red-500">+</div>
                                <span className="text-sm text-gray-400 font-mono">MP CAP</span>
                            </div>
                            <div className="text-right text-green-400 font-bold">+10</div>

                            <div className="col-span-2 border-t border-white/10 my-1" />

                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-[10px] text-yellow-500">★</span>
                                <span className="text-sm text-gray-100 font-mono">STAT POINTS</span>
                            </div>
                            <div className="text-right text-yellow-400 font-bold text-lg">+3</div>
                        </div>

                        <button
                            onClick={handleClose}
                            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-header tracking-widest text-lg transition-colors clip-path-polygon"
                            style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                        >
                            ACCEPT POWER
                        </button>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpModal;
