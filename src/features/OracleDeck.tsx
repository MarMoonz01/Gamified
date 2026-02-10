
import { useDragonStore } from '../logic/dragonStore';
import { ORACLE_CARDS } from '../data/oracleCards';
import React, { useState } from 'react';
import type { OracleCard } from '../logic/dragonStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Droplet, Loader } from 'lucide-react';
import { useSound } from '../logic/soundStore';
import { geminiService } from '../logic/GeminiService';
import { v4 as uuidv4 } from 'uuid';

const OracleDeck: React.FC = () => {
    const { dragonInk, collectedCards, unlockCard } = useDragonStore();
    const { playSound } = useSound();

    // UI State
    const [revealing, setRevealing] = useState(false);
    const [justUnlocked, setJustUnlocked] = useState<OracleCard | null>(null);

    const handleInvoke = async () => {
        if (dragonInk < 1) return;
        if (revealing) return;

        setRevealing(true);
        playSound('CLICK');

        try {
            // Magical Delay (and API wait)
            // Use Gemini to generate a unique card
            const generatedCard = await geminiService.generateOracleCard();

            if (generatedCard) {
                const newCard: OracleCard = {
                    id: uuidv4(),
                    ...generatedCard
                };

                unlockCard(newCard);
                setJustUnlocked(newCard);
                playSound('LEVEL_UP');
            } else {
                // Fallback if AI fails: Pick a random curated card
                const randomCard = ORACLE_CARDS[Math.floor(Math.random() * ORACLE_CARDS.length)];
                const newCard = { ...randomCard, id: uuidv4() }; // Make it a unique instance
                unlockCard(newCard);
                setJustUnlocked(newCard);
                playSound('LEVEL_UP');
            }
        } catch (error) {
            console.error("Oracle Invocation Failed:", error);
            playSound('ERROR');
        } finally {
            setRevealing(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center p-8 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a0b2e_0%,#000000_100%)] -z-20" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] -z-10 animate-pulse" />

            {/* Header */}
            <div className="flex flex-col items-center mb-10 z-10">
                <h1 className="text-4xl font-medieval text-[#D4AF37] text-shadow-lg flex items-center gap-3">
                    <Sparkles className="text-purple-400" />
                    The Infinite Oracle
                    <Sparkles className="text-purple-400" />
                </h1>
                <p className="text-purple-200/60 font-fantasy italic mt-2">
                    "Offer your Ink, and the Spirits shall speak."
                </p>
            </div>

            {/* Altar Area (Invoke) */}
            <div className="mb-12 relative z-10">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                    <button
                        onClick={handleInvoke}
                        disabled={dragonInk < 1 || revealing}
                        className={`relative px-12 py-6 bg-black border-2 border-[#D4AF37] rounded-lg shadow-2xl flex flex-col items-center gap-2 transition-transform active:scale-95 ${dragonInk < 1 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        {revealing ? (
                            <Loader size={32} className="text-purple-400 animate-spin" />
                        ) : (
                            <Droplet size={32} className={dragonInk > 0 ? "text-purple-400 animate-bounce" : "text-gray-500"} />
                        )}

                        <span className="font-medieval text-2xl text-[#D4AF37]">
                            {revealing ? "Conjuring..." : "Invoke the Oracle"}
                        </span>
                        <span className="text-xs uppercase tracking-widest text-purple-300 font-bold">
                            Cost: 1 Dragon Ink
                        </span>
                    </button>
                </div>
                {/* Ink Counter */}
                <div className="absolute -top-4 -right-12 bg-[#2C1810] border border-[#D4AF37] rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-20">
                    <span className="font-bold text-white text-lg">{dragonInk}</span>
                </div>
            </div>

            {/* Reveal Overlay */}
            <AnimatePresence>
                {justUnlocked && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                        onClick={() => setJustUnlocked(null)}
                    >
                        <motion.div
                            className="bg-[#1a0b2e] border-4 border-[#D4AF37] p-8 rounded-xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(147,51,234,0.5)] relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold ${justUnlocked.rarity === 'LEGENDARY' ? 'bg-yellow-600 text-black' : justUnlocked.rarity === 'RARE' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'}`}>
                                {justUnlocked.rarity}
                            </span>

                            <div className="w-32 h-44 bg-black/50 mx-auto mb-6 border border-purple-500/30 rounded flex items-center justify-center">
                                <Sparkles size={48} className="text-purple-400 opacity-50" />
                            </div>

                            <h2 className="text-3xl font-medieval text-[#D4AF37] mb-2">{justUnlocked.name}</h2>
                            <p className="text-purple-300 text-sm uppercase tracking-widest mb-4">{justUnlocked.title}</p>
                            <p className="text-slate-300 font-serif italic mb-6">"{justUnlocked.description}"</p>

                            <div className="bg-purple-900/30 p-4 rounded border border-purple-500/30">
                                <p className="text-green-300 font-bold text-sm italic">{justUnlocked.effectDescription}</p>
                            </div>

                            <button
                                onClick={() => setJustUnlocked(null)}
                                className="mt-8 px-6 py-2 bg-[#D4AF37] text-black font-bold rounded hover:bg-yellow-400 transition-colors w-full"
                            >
                                CLAIM
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card Gallery */}
            <div className="w-full max-w-6xl">
                <h3 className="text-xl font-medieval text-[#D4AF37]/50 mb-6 border-b border-[#D4AF37]/20 pb-2">Your Collection ({collectedCards.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {collectedCards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative aspect-[3/4] rounded-lg border-2 border-[#D4AF37] bg-black/60 shadow-lg group hover:scale-105 transition-all duration-300"
                        >
                            <div className="p-4 h-full flex flex-col items-center text-center">
                                <span className={`absolute top-2 right-2 text-[8px] px-1 rounded ${card.rarity === 'LEGENDARY' ? 'bg-yellow-600' : card.rarity === 'RARE' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                                    {card.rarity}
                                </span>

                                <div className="flex-1 flex items-center justify-center">
                                    <Sparkles className="text-purple-500/50" />
                                </div>
                                <h4 className="font-bold text-[#D4AF37] font-medieval text-sm">{card.name}</h4>
                                <p className="text-[10px] text-purple-200/60 uppercase mt-1">{card.type}</p>

                                {/* Hover Tooltip */}
                                <div className="absolute inset-0 bg-black/95 p-4 hidden group-hover:flex flex-col justify-center items-center text-center z-10 transition-opacity">
                                    <p className="text-[#D4AF37] text-xs font-bold mb-2">{card.title}</p>
                                    <p className="text-slate-400 text-[10px] italic mb-2">"{card.description}"</p>
                                    <p className="text-green-400 text-[10px] italic">{card.effectDescription}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Placeholder for empty state */}
                    {collectedCards.length === 0 && (
                        <div className="col-span-full text-center text-slate-500 py-12">
                            <p>No spirits have been invoked yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OracleDeck;
