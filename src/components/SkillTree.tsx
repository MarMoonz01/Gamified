import React from 'react';
import { motion } from 'framer-motion';

interface SkillNode {
    id: string;
    x: number;
    y: number;
    label: string;
    level: number;
    maxLevel: number;
}

const skills: SkillNode[] = [
    { id: 'L', x: 50, y: 20, label: 'LISTENING', level: 3, maxLevel: 9 },
    { id: 'R', x: 80, y: 50, label: 'READING', level: 4, maxLevel: 9 },
    { id: 'W', x: 50, y: 80, label: 'WRITING', level: 2, maxLevel: 9 },
    { id: 'S', x: 20, y: 50, label: 'SPEAKING', level: 5, maxLevel: 9 },
];

const connections = [
    [0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]
];

const SkillTree: React.FC = () => {
    return (
        <div className="relative w-full h-[200px] border border-blue-900/30 bg-black/20 overflow-hidden p-4">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map(([start, end], index) => {
                    const startNode = skills[start];
                    const endNode = skills[end];
                    return (
                        <motion.line
                            key={index}
                            x1={`${startNode.x}%`}
                            y1={`${startNode.y}%`}
                            x2={`${endNode.x}%`}
                            y2={`${endNode.y}%`}
                            stroke="#1e3a8a" // Blue-900
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                        />
                    );
                })}
            </svg>

            {skills.map((skill) => (
                <motion.div
                    key={skill.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                    style={{ left: `${skill.x}%`, top: `${skill.y}%` }}
                    whileHover={{ scale: 1.1 }}
                >
                    {/* Node */}
                    <div className={`w-3 h-3 border border-blue-400 ${skill.level >= 5 ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-black'} relative z-10 transition-colors duration-300`}>
                    </div>

                    {/* Label */}
                    <div className="mt-2 text-[10px] sm:text-xs font-mono text-blue-300/70 bg-black/80 px-1 border border-blue-900/50">
                        {skill.label} [Lv.{skill.level}]
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default SkillTree;
