import React, { useState } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import PixelDragon from '../components/PixelDragon';
import { Brain, Scroll } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollBorder from '../components/ScrollBorder';

const Codex: React.FC = () => {
    const { dragons } = useDragonStore();
    const [selectedDragonId, setSelectedDragonId] = useState<string | null>(null);

    // Get selected dragon object
    const selectedDragon = dragons.find(d => d.id === selectedDragonId);

    return (
        <div className="w-full h-full p-8 flex gap-8">
            {/* LEFT: Dragon Detail */}
            <ScrollBorder className="flex-1 flex flex-col items-center justify-center relative overflow-hidden" title={selectedDragon?.name || "The Archives"}>
                <div className="w-full h-full flex flex-col items-center justify-center">
                    {selectedDragon ? (
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={selectedDragon.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="relative flex flex-col items-center"
                            >
                                {/* Render Pixel Dragon or Emoji */}
                                {selectedDragon.dna ? (
                                    <div className="w-64 h-64 filter drop-shadow-xl mb-6">
                                        <PixelDragon dna={selectedDragon.dna} size={16} />
                                    </div>
                                ) : (
                                    <div className="text-9xl filter drop-shadow-2xl animate-bounce-slow mb-6">
                                        {selectedDragon.type === 'FIRE' ? '🔥' :
                                            selectedDragon.type === 'WATER' ? '💧' :
                                                selectedDragon.type === 'WIND' ? '🌪️' :
                                                    selectedDragon.type === 'TERRA' ? '🌿' :
                                                        selectedDragon.type === 'RADIANT' ? '✨' : '🔮'}
                                    </div>
                                )}

                                <div className="flex gap-2 mb-6">
                                    <span className="px-3 py-1 bg-[#2C1810] text-[#D4AF37] text-xs font-bold rounded uppercase tracking-wider">
                                        Lvl {selectedDragon.level}
                                    </span>
                                    <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#8B4513] text-xs font-bold rounded uppercase tracking-wider">
                                        {selectedDragon.stage} {selectedDragon.type}
                                    </span>
                                </div>

                                <div className="bg-[#FDF6E3] p-6 rounded-sm border border-[#D7C4A1] text-left shadow-inner max-w-sm w-full mb-6 relative">
                                    <h3 className="text-sm font-bold text-[#8B4513] uppercase mb-2 flex items-center gap-2 border-b border-[#D7C4A1]/50 pb-1">
                                        <Scroll size={16} /> Lore
                                    </h3>
                                    <p className="text-[#5D4037] italic leading-relaxed font-serif text-center text-sm">
                                        "{selectedDragon.lore}"
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                    <div className="bg-white/40 p-3 rounded border border-[#D7C4A1] text-center">
                                        <div className="text-xs text-[#8B4513] uppercase font-bold">Happiness</div>
                                        <div className="text-xl font-medieval text-[#2C1810]">{selectedDragon.happiness}%</div>
                                    </div>
                                    <div className="bg-white/40 p-3 rounded border border-[#D7C4A1] text-center">
                                        <div className="text-xs text-[#8B4513] uppercase font-bold">XP</div>
                                        <div className="text-xl font-medieval text-[#2C1810]">{Math.floor(selectedDragon.xp)}</div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="text-center opacity-40">
                            <Brain size={64} className="mx-auto mb-4 text-[#8B4513]" />
                            <h2 className="text-2xl font-medieval text-[#2C1810]">Select a Dragon</h2>
                            <p className="text-[#5D4037]">View your discovered species</p>
                        </div>
                    )}
                </div>
            </ScrollBorder>

            {/* RIGHT: Bestiary List */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="bg-[#2C1810] text-[#D4AF37] p-3 text-center font-medieval uppercase tracking-widest border-2 border-[#D4AF37] shadow-lg">
                    Collection ({dragons.length})
                </div>

                <div className="flex-1 glass-panel overflow-y-auto pr-2 p-2">
                    {/* Dragon List */}
                    <div className="flex flex-col gap-2">
                        {dragons.map(dragon => (
                            <motion.div
                                key={dragon.id}
                                onClick={() => setSelectedDragonId(dragon.id)}
                                className={`p-3 rounded-sm border flex items-center gap-3 cursor-pointer transition-all relative
                                    ${selectedDragonId === dragon.id ? 'bg-[#FDF6E3] border-[#8B4513] shadow-md scale-[1.02]' : 'bg-white/40 border-transparent hover:bg-white/60'}
                                `}
                            >
                                <div className="w-12 h-12 bg-[#2C1810]/5 rounded flex items-center justify-center overflow-hidden border border-[#D7C4A1]">
                                    {dragon.dna ? (
                                        <PixelDragon dna={dragon.dna} size={3} />
                                    ) : (
                                        <span className="text-2xl">
                                            {dragon.type === 'FIRE' ? '🔥' :
                                                dragon.type === 'WATER' ? '💧' :
                                                    dragon.type === 'WIND' ? '🌪️' :
                                                        dragon.type === 'TERRA' ? '🌿' :
                                                            dragon.type === 'RADIANT' ? '✨' : '🔮'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-[#2C1810] text-sm">{dragon.name}</div>
                                    <div className="text-[10px] text-[#5D4037] uppercase">{dragon.type} • Lvl {dragon.level}</div>
                                </div>
                                {/* Selection Indicator */}
                                {selectedDragonId === dragon.id && (
                                    <div className="absolute right-2 text-[#8B4513] opacity-50"><Scroll size={14} /></div>
                                )}
                            </motion.div>
                        ))}

                        {dragons.length === 0 && (
                            <div className="text-center p-8 text-[#8B4513]/50 italic text-sm">
                                The Codex is waiting for your first hatching.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Codex;
