import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Spark {
    id: number;
    x: number;
    y: number;
}

interface ClickSparkProps {
    color?: string;
}

const ClickSpark: React.FC<ClickSparkProps> = ({ color = '#3b82f6' }) => {
    const [sparks, setSparks] = useState<Spark[]>([]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const newSpark = { id: Date.now(), x: e.clientX, y: e.clientY };
            setSparks(prev => [...prev, newSpark]);

            // Clean up spark after animation
            setTimeout(() => {
                setSparks(prev => prev.filter(s => s.id !== newSpark.id));
            }, 1000);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            <AnimatePresence>
                {sparks.map(spark => (
                    <motion.div
                        key={spark.id}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute w-8 h-8 rounded-full border-2 bg-white/20 -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: spark.x,
                            top: spark.y,
                            borderColor: color,
                            boxShadow: `0 0 15px ${color}`
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ClickSpark;
