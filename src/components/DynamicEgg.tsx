import React from 'react';
import { motion } from 'framer-motion';
import type { Egg } from '../logic/dragonStore';

interface DynamicEggProps {
    egg: Egg;
}

const DynamicEgg: React.FC<DynamicEggProps> = ({ egg }) => {
    // Calculate dominant color based on history
    const h = egg.history;

    // Normalize weights to determine tint
    // Red (Fire/Writing), Blue (Water/Listening), Green (Terra/Health), 
    // Yellow (Wind/Speaking), Purple (Arcane/Reading), Gold (Radiant/Social)

    // Determine leading element for dominant hue
    let dominantColor = '#FDF6E3'; // Default
    let glowColor = 'transparent';

    if (h.writing > 10) { dominantColor = '#EF4444'; glowColor = '#FCA5A5'; } // Red
    else if (h.listening > 10) { dominantColor = '#3B82F6'; glowColor = '#93C5FD'; } // Blue
    else if (h.speaking > 10) { dominantColor = '#F59E0B'; glowColor = '#FCD34D'; } // Yellow
    else if (h.health > 10) { dominantColor = '#10B981'; glowColor = '#6EE7B7'; } // Green
    else if (h.reading > 10) { dominantColor = '#8B5CF6'; glowColor = '#C4B5FD'; } // Purple

    // Rarity Effects
    const isRare = egg.rarity === 'RARE';
    const isLegendary = egg.rarity === 'LEGENDARY';

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Glow Aura */}
            <motion.div
                className="absolute inset-0 rounded-full blur-3xl"
                animate={{
                    backgroundColor: glowColor,
                    opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Egg SVG */}
            <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-2xl z-10">
                <defs>
                    <radialGradient id="eggGrad" cx="30%" cy="30%" r="90%">
                        <stop offset="0%" stopColor="#FFF" stopOpacity="0.9" />
                        <stop offset="50%" stopColor={dominantColor} />
                        <stop offset="100%" stopColor="#2C1810" />
                    </radialGradient>

                    {/* Texture Noise */}
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                </defs>

                {/* Base Shape */}
                <motion.path
                    d="M50 5 
                       C 85 5, 95 45, 95 75 
                       C 95 115, 75 128, 50 128 
                       C 25 128, 5 115, 5 75 
                       C 5 45, 15 5, 50 5 Z"
                    fill="url(#eggGrad)"
                    stroke="#2C1810"
                    strokeWidth="2"
                    animate={{
                        scale: [1, 1.02, 1],
                        rotate: [0, 1, -1, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "mirror"
                    }}
                />

                {/* Patterns based on Rarity */}
                {isRare && (
                    <path
                        d="M20 80 Q 50 110 80 80"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                )}

                {isLegendary && (
                    <g>
                        <circle cx="50" cy="60" r="5" fill="#D4AF37" />
                        <path d="M50 30 L50 90 M20 60 L80 60" stroke="#D4AF37" strokeWidth="2" />
                    </g>
                )}

                {/* Cracks (Progress) */}
                {egg.isReadyToHatch && (
                    <motion.path
                        d="M30 40 L40 50 L35 60 L50 55"
                        fill="none"
                        stroke="#2C1810"
                        strokeWidth="1.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                    />
                )}
            </svg>
        </div>
    );
};

export default DynamicEgg;
