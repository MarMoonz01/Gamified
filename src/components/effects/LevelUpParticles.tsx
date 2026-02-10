import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PARTICLE_COUNT = 50;

const LevelUpParticles: React.FC = () => {
    const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number, color: string }>>([]);

    useEffect(() => {
        const colors = ['#eab308', '#3b82f6', '#ffffff']; // Gold, Blue, White
        const newParticles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100, // Start below screen
            color: colors[Math.floor(Math.random() * colors.length)]
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ y: p.y, x: p.x, opacity: 1 }}
                    animate={{
                        y: [-100, Math.random() * window.innerHeight],
                        x: p.x + (Math.random() - 0.5) * 200,
                        opacity: 0
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        ease: "easeOut",
                        delay: Math.random() * 0.5
                    }}
                    className="absolute w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]"
                    style={{ backgroundColor: p.color }}
                />
            ))}
        </div>
    );
};

export default LevelUpParticles;
