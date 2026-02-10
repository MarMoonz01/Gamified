import React from 'react';
import { motion } from 'framer-motion';

interface EggProps {
    heat: number;
    requiredHeat: number;
    onClick?: () => void;
}

const EggComponent: React.FC<EggProps> = ({ heat, requiredHeat, onClick }) => {
    const progress = Math.min(100, (heat / requiredHeat) * 100);
    const isReady = progress >= 100;

    // Animation variants
    const shakeVariants = {
        idle: { rotate: 0 },
        wiggle: { rotate: [-2, 2, -2, 2, 0], transition: { duration: 0.5 } },
        crack: { scale: [1, 1.05, 1], rotate: [-5, 5, -5, 5, 0], transition: { duration: 0.3 } }
    };

    // Determine animation state based on progress
    let animateState = "idle";
    if (progress > 30 && progress < 70) animateState = "wiggle";
    if (progress >= 70) animateState = "crack";
    if (isReady) animateState = "crack"; // Aggressive cracking

    return (
        <div className="relative flex flex-col items-center justify-center cursor-pointer" onClick={onClick}>
            {/* Glow Effect */}
            <motion.div
                className="absolute inset-0 rounded-full blur-3xl"
                animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [0.8, 1.1, 0.8],
                    backgroundColor: isReady ? "#FFD700" : "#E0F7FA"
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* The Egg SVG */}
            <motion.svg
                width="200"
                height="250"
                viewBox="0 0 200 250"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                variants={shakeVariants}
                animate={isReady ? "crack" : animateState}
                whileTap={{ scale: 0.95 }}
            >
                {/* Egg Base */}
                <path
                    d="M100 240C155.228 240 200 195.228 200 140C200 84.7715 155.228 10 100 10C44.7715 10 0 84.7715 0 140C0 195.228 44.7715 240 100 240Z"
                    fill="url(#eggGradient)"
                    stroke="#D4AF37" // Gold Stroke
                    strokeWidth="4"
                />

                {/* Patterns (Scales) */}
                <circle cx="50" cy="100" r="10" fill="rgba(255,255,255,0.2)" />
                <circle cx="150" cy="120" r="15" fill="rgba(255,255,255,0.2)" />
                <circle cx="100" cy="180" r="20" fill="rgba(255,255,255,0.2)" />

                {/* Cracks (Visible only when high heat) */}
                {progress > 50 && (
                    <motion.path
                        d="M100 10L90 40L110 60L95 90"
                        stroke="#4E342E"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                    />
                )}
                {progress > 80 && (
                    <motion.path
                        d="M50 140L80 160L60 190"
                        stroke="#4E342E"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                    />
                )}

                <defs>
                    <linearGradient id="eggGradient" x1="100" y1="10" x2="100" y2="240" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFF9C4" /> {/* Pale Cream */}
                        <stop offset="1" stopColor="#FFE082" /> {/* Amber */}
                    </linearGradient>
                </defs>
            </motion.svg>

            {/* Click to Hatch Instructions */}
            {isReady && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 px-6 py-2 bg-dragon-gold text-white font-bold rounded-full shadow-lg shadow-yellow-400/50 animate-bounce"
                >
                    CLICK TO HATCH!
                </motion.div>
            )}

            {/* Heat Progress */}
            {!isReady && (
                <div className="mt-6 w-48 h-4 bg-white/50 rounded-full overflow-hidden border border-white">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-300 to-red-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="mt-2 font-mono text-sm text-sky-900 font-bold">
                {heat} / {requiredHeat} HEAT
            </div>
        </div>
    );
};

export default EggComponent;
