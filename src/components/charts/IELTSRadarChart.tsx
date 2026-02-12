import React from 'react';
import { motion } from 'framer-motion';

interface IELTSData {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    overall: number;
}

const IELTSRadarChart: React.FC<{ data: IELTSData; target?: number }> = ({ data, target = 7.0 }) => {
    const size = 300;
    const center = size / 2;
    const radius = 100; // Radius of graph
    const maxScore = 9;

    // Calculate X,Y coordinates
    const getPoint = (score: number, angleIndex: number, totalPoints: number) => {
        const angle = (Math.PI * 2 * angleIndex) / totalPoints - Math.PI / 2;
        const r = (score / maxScore) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    };

    // Axes Order: Listening -> Reading -> Writing -> Speaking (Clockwise)
    const scores = [data.listening, data.reading, data.writing, data.speaking];
    const labels = ["Listening", "Reading", "Writing", "Speaking"];

    // Path for current scores
    const pathData = scores.map((score, i) => getPoint(score, i, 4)).join(" ");

    // Path for target
    const targetData = scores.map(() => target).map((s, i) => getPoint(s, i, 4)).join(" ");

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Grid (Concentric Circles) */}
                {[3, 5, 7, 9].map((level) => (
                    <circle
                        key={level}
                        cx={center}
                        cy={center}
                        r={(level / maxScore) * radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        className="opacity-20"
                    />
                ))}

                {/* Axes Lines */}
                {labels.map((_, i) => {
                    const endPoint = getPoint(9, i, 4);
                    return (
                        <line
                            key={i}
                            x1={center} y1={center}
                            x2={endPoint.split(',')[0]} y2={endPoint.split(',')[1]}
                            stroke="#d1d5db"
                            strokeWidth="1"
                            className="opacity-30"
                        />
                    );
                })}

                {/* Target Area (Dotted Line) */}
                <polygon points={targetData} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5 5" opacity="0.5" />

                {/* Current Score Area (Filled Polygon) */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.7, scale: 1 }}
                    transition={{ duration: 1, type: "spring" }}
                    points={pathData}
                    fill="rgba(212, 175, 55, 0.2)" // Dragon Gold tint
                    stroke="#D4AF37"
                    strokeWidth="2"
                />

                {/* Dots at corners */}
                {scores.map((score, i) => {
                    const [x, y] = getPoint(score, i, 4).split(',');
                    return (
                        <motion.circle
                            key={i} cx={x} cy={y} r="4" fill="#D4AF37"
                            initial={{ r: 0 }} animate={{ r: 4 }} transition={{ delay: 0.5 }}
                        />
                    );
                })}

                {/* Labels */}
                {labels.map((label, i) => {
                    const [x, y] = getPoint(10.5, i, 4).split(','); // Push label out slightly (score 10.5 distance)
                    return (
                        <text
                            key={i} x={x} y={y}
                            textAnchor="middle" dominantBaseline="middle"
                            className="text-xs font-bold fill-slate-600 uppercase tracking-widest"
                        >
                            {label}
                        </text>
                    );
                })}
            </svg>

            {/* Center Overall Score */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800 drop-shadow-sm">{data.overall}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Overall</span>
            </div>
        </div>
    );
};

export default IELTSRadarChart;
