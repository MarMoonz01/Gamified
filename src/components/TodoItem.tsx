import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShieldAlert } from 'lucide-react';
import { useDragonStore, type Task as Todo, type Rank } from '../logic/dragonStore';
import clsx from 'clsx';

const rankColorMap: Record<Rank, string> = {
    'E': 'text-fantasy-wood border-fantasy-wood',
    'D': 'text-fantasy-green border-fantasy-green shadow-[0_0_5px_#2e7d32]',
    'C': 'text-fantasy-blue border-fantasy-blue shadow-[0_0_5px_#1565c0]',
    'B': 'text-fantasy-gold border-fantasy-gold shadow-[0_0_8px_#ffd700]',
    'A': 'text-fantasy-red border-fantasy-red shadow-[0_0_10px_#8b0000]',
    'S': 'text-fantasy-purple border-fantasy-purple shadow-[0_0_12px_#6a1b9a]',
    'SS': 'text-fantasy-ink border-fantasy-ink bg-fantasy-red/10 shadow-[0_0_15px_#ffffff]',
};

const TodoItem: React.FC<{ todo: Todo }> = ({ todo }) => {
    const { toggleTask: toggleTodo, deleteTask: deleteTodo } = useDragonStore();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, rotate: 1 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
                "group relative p-4 border-2 rounded-sm shadow-md transition-all cursor-pointer overflow-hidden",
                todo.completed
                    ? "bg-fantasy-paper-light opacity-60 grayscale border-fantasy-wood/20 scale-95"
                    : "bg-fantasy-paper-light border-fantasy-wood/30 hover:shadow-lg hover:border-fantasy-red/40"
            )}
            onClick={() => toggleTodo(todo.id)}
        >
            {/* Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-40 z-0 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

            {/* Rank Stamp */}
            <div className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center border-2 rounded-full font-black font-fantasy text-xs rotate-[-15deg] z-10 bg-fantasy-paper ${rankColorMap[todo.rank]}`}>
                {todo.rank}
            </div>

            <div className="relative z-10 pr-8">
                <div className="flex items-start gap-2">
                    <ShieldAlert size={16} className={clsx("mt-1 shrink-0", todo.completed ? "text-fantasy-wood/30" : "text-fantasy-red/70")} />
                    <div>
                        <h3 className={clsx(
                            "font-fantasy font-bold text-lg leading-tight mb-1",
                            todo.completed ? "text-fantasy-wood/50 line-through" : "text-fantasy-wood-dark"
                        )}>
                            {todo.title}
                        </h3>
                        {todo.description && (
                            <p className="font-inter text-xs text-fantasy-wood/70 leading-relaxed line-clamp-2 italic">
                                "{todo.description}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Cleared Stamp overlay */}
                {todo.completed && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-fantasy-red/50 text-fantasy-red/50 font-black font-fantasy text-2xl px-2 py-1 rotate-[-20deg] rounded opacity-80 pointer-events-none">
                        CLEARED
                    </div>
                )}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 text-fantasy-wood/30 hover:text-fantasy-red transition-opacity p-1 z-20"
            >
                <Trash2 size={14} />
            </button>
        </motion.div>
    );
};

export default TodoItem;
