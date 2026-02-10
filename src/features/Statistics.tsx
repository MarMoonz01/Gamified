import React from 'react';
import { useDragonStore } from '../logic/dragonStore';
import { motion } from 'framer-motion';
import { BarChart, Activity, Calendar } from 'lucide-react';

const Statistics: React.FC = () => {
    const { getDailyHeat, activityLog } = useDragonStore();
    const dailyData = getDailyHeat();

    // Calculate total Heat (Productivity)
    const totalHeat = activityLog.reduce((acc, log) => acc + log.amount, 0);

    return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-3xl h-[80vh] overflow-y-auto">
            <h2 className="text-3xl font-medieval text-dragon-gold mb-6 flex items-center gap-3">
                <Activity />
                The Chronicle of Deeds
            </h2>

            {/* Overall Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">Total Heat Generated</div>
                    <div className="text-4xl font-bold text-orange-400">{totalHeat.toLocaleString()} 🔥</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">Days Active</div>
                    <div className="text-4xl font-bold text-blue-400">{new Set(activityLog.map(l => l.date)).size} 📅</div>
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart size={20} />
                    Weekly Heat Resonance
                </h3>
                <div className="h-48 flex items-end gap-2">
                    {dailyData.map((amount, index) => {
                        const heightPercent = Math.min(100, Math.max(5, (amount / 1000) * 100)); // Cap at 1000 heat for 100% height visualization
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercent}%` }}
                                    className={`w-full rounded-t-lg transition-all ${index === 6 ? 'bg-dragon-gold shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'bg-slate-700 group-hover:bg-slate-600'}`}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 text-xs text-center -mt-6 font-bold text-white transition-opacity">
                                        {amount}
                                    </div>
                                </motion.div>
                                <span className="text-xs text-slate-500 font-bold">{index === 6 ? 'Today' : `-${6 - index}d`}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="text-center text-xs text-slate-500 mt-2">Target: 1000 Heat / Day</div>
            </div>

            {/* Detailed Log */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Recent Deeds
                </h3>
                <div className="space-y-2">
                    {activityLog.slice(-10).reverse().map((log, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-white font-bold">{log.source.replace('IELTS_', '').replace('_', ' ')}</span>
                                <span className="text-xs text-slate-500">{log.date}</span>
                            </div>
                            <span className="text-orange-400 font-bold">+{log.amount} 🔥</span>
                        </div>
                    ))}
                    {activityLog.length === 0 && (
                        <div className="text-slate-500 text-center py-4">No deeds recorded yet. Go to the Hatchery!</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Statistics;
