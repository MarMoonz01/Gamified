import React from 'react';
import { useDragonStore } from '../logic/dragonStore';
import { motion } from 'framer-motion';

const Sanctuary: React.FC = () => {
    const { dragons } = useDragonStore();

    return (
        <div className="w-full h-full relative">
            {/* The Island (Visual only for now) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Simple CSS Island */}
                <div className="w-[800px] h-[400px] bg-[#81C784] rounded-[50%] blur-sm opacity-80 border-t-8 border-[#A5D6A7] transform scale-y-50 translate-y-40 shadow-2xl" />
            </div>

            {/* Dragons Roaming */}
            <div className="relative w-full h-full z-10">
                {dragons.length === 0 ? (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-sky-800/50 font-medieval text-2xl">
                        The Sanctuary is quiet... <br />
                        <span className="text-sm font-sans">Visit the Hatchery OR Challenge a Mock Test.</span>
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

const DragonSprite: React.FC<{ dragon: any, index: number }> = ({ dragon, index }) => {
    // Random positions for demo
    const randomX = React.useMemo(() => Math.random() * 60 + 20, []);
    const randomY = React.useMemo(() => Math.random() * 40 + 30, []);
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
                y: [0, -20, 0],
                x: [0, 10, 0]
            }}
            transition={{
                duration: 4 + index,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5
            }}
            whileHover={{ scale: 1.2 }}
            onClick={handlePet}
        >
            {/* Heart Popup */}
            {isPet && (
                <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -40, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute -top-4 text-2xl z-20 pointer-events-none"
                >
                    ❤️
                </motion.div>
            )}

            {/* Placeholder Dragon */}
            <div className={`w-16 h-16 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-2xl
                ${dragon.type === 'FIRE' ? 'bg-orange-400' :
                    dragon.type === 'WATER' ? 'bg-blue-400' :
                        dragon.type === 'WIND' ? 'bg-yellow-200' :
                            dragon.type === 'TERRA' ? 'bg-green-600' : 'bg-purple-500'
                }`}
            >
                🐲
            </div>

            <div className="mt-2 px-2 py-1 bg-white/80 rounded-full text-xs font-bold text-sky-900 opacity-0 group-hover:opacity-100 transition-opacity">
                {dragon.name}
                <div className="text-[10px] text-slate-500">Lvl {dragon.level}</div>
            </div>
        </motion.div>
    );
};

export default Sanctuary;
