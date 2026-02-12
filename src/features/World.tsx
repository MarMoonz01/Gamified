import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Castle, Map, Skull, Book, ShoppingBag, Home } from 'lucide-react';
import Parchment from '../components/ui/Parchment';
import { useSound } from '../logic/soundStore';

const LocationPin: React.FC<{
    x: number;
    y: number;
    label: string;
    icon: any;
    path: string;
    color: string;
    delay?: number;
}> = ({ x, y, label, icon: Icon, path, color, delay = 0 }) => {
    const navigate = useNavigate();
    const { playSound } = useSound();

    return (
        <motion.div
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{ top: `${y}%`, left: `${x}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: "spring", stiffness: 200 }}
            onClick={() => {
                playSound('CLICK');
                navigate(path);
            }} // Trigger sound on navigation
        >
            <motion.div
                whileHover={{ scale: 1.2, y: -5 }}
                className={`p-3 rounded-full bg-fantasy-paper border-2 border-${color}-600 shadow-[0_0_15px_rgba(0,0,0,0.3)] z-10 relative group-hover:bg-${color}-50 transition-colors`}
            >
                <Icon size={24} className={`text-${color}-700`} />
            </motion.div>

            <div className="mt-2 px-3 py-1 bg-fantasy-wood-dark/90 text-fantasy-paper text-xs font-bold font-medieval rounded border border-fantasy-gold/30 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                {label}
            </div>

            {/* Pulsing effect */}
            <div className={`absolute top-3 left-3 w-full h-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-${color}-500/50 animate-ping opacity-20 pointer-events-none`} />
        </motion.div>
    );
};

const WorldMap: React.FC = () => {
    return (
        <div className="h-full w-full p-6 bg-black/90 flex items-center justify-center">
            <Parchment className="w-full h-full max-w-5xl relative overflow-hidden shadow-2xl" variant="aged">

                {/* Map Texture / Background */}
                <div className="absolute inset-0 bg-[#e6d5b8] opacity-50"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]"></div>

                {/* Terrain features (CSS shapes for now) */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-800/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-stone-800/5 rounded-full blur-3xl" />

                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

                {/* Title */}
                <div className="absolute top-6 left-6 z-10">
                    <h1 className="text-4xl font-medieval text-fantasy-wood-dark tracking-widest drop-shadow-sm">
                        REALM OF KNOWLEDGE
                    </h1>
                    <div className="text-fantasy-wood/60 font-fantasy text-sm italic mt-1">
                        "Navigate your destiny..."
                    </div>
                </div>

                {/* Locations */}
                <LocationPin
                    x={50} y={45}
                    label="Adventurer's Guild"
                    icon={Castle}
                    path="/guild"
                    color="blue"
                    delay={0.1}
                />

                <LocationPin
                    x={25} y={30}
                    label="The Daily City"
                    icon={Home}
                    path="/quests"
                    color="green"
                    delay={0.2}
                />

                <LocationPin
                    x={75} y={60}
                    label="Dragon Lairs"
                    icon={Skull}
                    path="/dungeon"
                    color="red"
                    delay={0.3}
                />

                <LocationPin
                    x={80} y={20}
                    label="Ancient Library"
                    icon={Book}
                    path="/profile" // Placeholder for now
                    color="purple"
                    delay={0.4}
                />

                <LocationPin
                    x={20} y={70}
                    label="Merchant's Outpost"
                    icon={ShoppingBag}
                    path="/shop"
                    color="yellow"
                    delay={0.5}
                />

                {/* Decorative Compass */}
                <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none">
                    <Map size={120} className="text-fantasy-wood-dark" />
                </div>

            </Parchment>
        </div>
    );
};

export default WorldMap;
