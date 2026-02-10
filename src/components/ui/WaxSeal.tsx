import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface WaxSealProps {
    onClick?: () => void;
    children?: React.ReactNode;
    color?: 'red' | 'gold' | 'blue' | 'purple' | 'green';
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const WaxSeal: React.FC<WaxSealProps> = ({ onClick, children, color = 'red', className, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-12 h-12 text-xs',
        lg: 'w-16 h-16 text-sm',
    };

    const colorClasses = {
        red: 'bg-[#8b0000] shadow-[inset_0_2px_5px_rgba(255,255,255,0.2),inset_0_-2px_5px_rgba(0,0,0,0.3)] text-red-100',
        gold: 'bg-[#ffd700] shadow-[inset_0_2px_5px_rgba(255,255,255,0.4),inset_0_-2px_5px_rgba(0,0,0,0.2)] text-amber-900',
        blue: 'bg-[#1565c0] shadow-[inset_0_2px_5px_rgba(255,255,255,0.2),inset_0_-2px_5px_rgba(0,0,0,0.3)] text-blue-100',
        purple: 'bg-[#6a1b9a] shadow-[inset_0_2px_5px_rgba(255,255,255,0.2),inset_0_-2px_5px_rgba(0,0,0,0.3)] text-purple-100',
        green: 'bg-[#2e7d32] shadow-[inset_0_2px_5px_rgba(255,255,255,0.2),inset_0_-2px_5px_rgba(0,0,0,0.3)] text-green-100',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={clsx(
                "rounded-full flex items-center justify-center font-fantasy font-bold relative border-2 border-black/10",
                "before:absolute before:inset-1 before:rounded-full before:border before:border-white/20 before:pointer-events-none",
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            style={{
                clipPath: 'circle(50% at 50% 50%)', // Keeps it round even with irregular border tricks if we add them later
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
            }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
            <span className="relative z-10 drop-shadow-md">
                {children}
            </span>
        </motion.button>
    );
};

export default WaxSeal;
