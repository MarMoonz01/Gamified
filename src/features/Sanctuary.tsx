import React from 'react';
import { useDragonStore, type Dragon } from '../logic/dragonStore';
import { motion } from 'framer-motion';
import PixelDragon from '../components/PixelDragon';

const Sanctuary: React.FC = () => {
    const { dragons } = useDragonStore();

    return (
        <div className="w-full h-full relative overflow-hidden bg-sky-50">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-100 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl"></div>
            </div>

            {/* The Island (Visual) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none translate-y-20">
                {/* Simple CSS Island */}
                <div className="relative">
                    <div className="w-[600px] h-[300px] bg-[#81C784] rounded-[50%] blur-sm opacity-90 border-t-8 border-[#A5D6A7] shadow-xl relative z-10" />
                    {/* Island Shadow/Depth */}
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
                        <DragonSprite key={dragon.id} dragon={dragon} index={index} />
                    ))
                )}
            </div>
        </div>
    );
};

const DragonSprite: React.FC<{ dragon: Dragon, index: number }> = ({ dragon, index }) => {
    // Random positions constrained roughly to the island area
    const randomX = React.useMemo(() => Math.random() * 40 + 30, []); // 30-70% width
    const randomY = React.useMemo(() => Math.random() * 30 + 35, []); // 35-65% height
    const [isPet, setIsPet] = React.useState(false);

    const handlePet = () => {
        setIsPet(true);
        setTimeout(() => setIsPet(false), 1000);
    };

    return (
        <motion.div
            className="absolute flex flex-col items-center cursor-pointer group"
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
            whileHover={{ scale: 1.1 }}
            onClick={handlePet}
        >
            {/* Heart Popup */}
            {isPet && (
                <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -40, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute -top-12 text-3xl z-20 pointer-events-none drop-shadow-md"
                >
                    ❤️
                </motion.div>
            )}

            {/* Dragon Avatar */}
            <div className={`relative w-16 h-16 rounded-full shadow-lg border-2 border-white/50 flex items-center justify-center
                ${dragon.type === 'FIRE' ? 'bg-orange-400/20' :
                    dragon.type === 'WATER' ? 'bg-blue-400/20' :
                        dragon.type === 'WIND' ? 'bg-yellow-200/20' :
                            dragon.type === 'TERRA' ? 'bg-green-600/20' : 'bg-purple-500/20'
                } backdrop-blur-sm transition-transform`}
            >
                <PixelDragon dna={dragon.dna} size={4} />
            </div>

            <div className="mt-2 px-3 py-1 bg-white/90 backdrop-blur rounded-full shadow-sm text-xs font-bold text-sky-900 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 pointer-events-none border border-white/50">
                {dragon.name}
            </div>
        </motion.div>
    );
};

export default Sanctuary;
