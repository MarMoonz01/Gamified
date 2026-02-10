import React from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { useDragonStore, type Habit } from '../logic/dragonStore';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface HabitItemProps {
    habit: Habit;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit }) => {
    const { triggerHabit, deleteHabit } = useDragonStore();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative p-3 rounded-sm bg-fantasy-paper-light border border-fantasy-wood/10 shadow-sm flex items-center justify-between gap-3 overflow-hidden"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

            {/* Label */}
            <div className="relative z-10 flex-1 min-w-0 flex flex-col">
                <h3 className="font-medieval text-lg text-fantasy-wood-dark truncate leading-tight">
                    {habit.title}
                </h3>
                <span className={clsx("text-[10px] font-bold tracking-widest uppercase",
                    habit.type === 'HEALTH' ? "text-fantasy-red" :
                        habit.type === 'STUDY' ? "text-fantasy-blue" :
                            habit.type === 'SOCIAL' ? "text-fantasy-purple" :
                                habit.type === 'GOLD' ? "text-fantasy-gold" :
                                    "text-fantasy-wood"
                )}>
                    {habit.type} OATH
                </span>
            </div>

            {/* Counter Control */}
            <div className="relative z-10 flex items-center gap-2 bg-fantasy-wood/5 rounded-full p-1 border border-fantasy-wood/10">
                <button
                    onClick={() => triggerHabit(habit.id, 'DOWN')}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-fantasy-wood/60 hover:text-fantasy-red hover:bg-fantasy-red/10 transition-colors"
                >
                    <Minus size={14} />
                </button>

                <div className="w-8 text-center font-fantasy font-bold text-lg text-fantasy-wood-dark">
                    {habit.value}
                </div>

                <button
                    onClick={() => triggerHabit(habit.id, 'UP')}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-fantasy-wood/60 hover:text-fantasy-green hover:bg-fantasy-green/10 transition-colors"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Delete (Hover only) */}
            <button
                onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 p-1 text-fantasy-wood/30 hover:text-fantasy-red transition-all"
            >
                <X size={12} />
            </button>
        </motion.div>
    );
};

export default HabitItem;
