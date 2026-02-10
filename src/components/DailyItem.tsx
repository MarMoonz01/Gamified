import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Calendar } from 'lucide-react';
import { useDragonStore, type Daily } from '../logic/dragonStore';
import clsx from 'clsx';
import WaxSeal from './ui/WaxSeal';

const DailyItem: React.FC<{ daily: Daily }> = ({ daily }) => {
    const { toggleDaily, deleteDaily } = useDragonStore();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
                "group relative flex items-center justify-between p-3 rounded-sm border shadow-sm transition-all cursor-pointer overflow-hidden",
                daily.completed
                    ? "bg-fantasy-purple/10 border-fantasy-purple/30"
                    : "bg-fantasy-paper-light border-fantasy-wood/10 hover:border-fantasy-purple/30"
            )}
            onClick={() => toggleDaily(daily.id)}
        >
            {/* Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

            <div className="relative z-10 flex items-center gap-4 flex-1">
                {/* Seal Checkbox */}
                <div onClick={(e) => e.stopPropagation()}>
                    <WaxSeal
                        size="sm"
                        color={daily.completed ? 'purple' : 'gold'}
                        onClick={() => toggleDaily(daily.id)}
                        className={clsx("transition-transform", daily.completed && "scale-110")}
                    >
                        {daily.completed ? <Check size={14} /> : <span className="font-fantasy text-[10px]">Quest</span>}
                    </WaxSeal>
                </div>

                <div className="flex flex-col flex-1">
                    <span className={clsx(
                        "font-medieval text-lg transition-all leading-tight",
                        daily.completed ? "text-fantasy-wood/40 line-through" : "text-fantasy-wood-dark"
                    )}>
                        {daily.title}
                    </span>
                    <span className="text-[10px] text-fantasy-wood/60 font-bold tracking-wide flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        STREAK: {daily.streak} DAYS
                    </span>
                </div>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); deleteDaily(daily.id); }}
                className="relative z-10 opacity-0 group-hover:opacity-100 text-fantasy-wood/30 hover:text-fantasy-red transition-opacity p-1"
            >
                <Trash2 size={16} />
            </button>
        </motion.div>
    );
};

export default DailyItem;
