import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragonStore } from '../logic/dragonStore';
import { ChevronUp, Zap } from 'lucide-react';
import LevelUpParticles from './effects/LevelUpParticles';

const LevelUpModal: React.FC = () => {
    const level = useDragonStore(state => state.level);
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

                        <div className="bg-white/5 p-4 rounded border border-white/10 mb-6">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Zap size={20} className="text-yellow-400" />
                                <span className="text-lg text-yellow-100 font-bold">ENERGY RESTORED!</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                Your Physical & Mental limits have increased!
                            </p>
                        </div>

                        <button
                            onClick={handleClose}
                            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-header tracking-widest text-lg transition-colors clip-path-polygon"
                            style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                        >
                            AWAKEN
                        </button>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpModal;
