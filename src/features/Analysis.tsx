import React from 'react';
import { useDragonStore } from '../logic/dragonStore';
import { motion } from 'framer-motion';
import { BarChart, Activity, Calendar, Target, Sword, Sparkles, AlertTriangle } from 'lucide-react';
import IELTSRadarChart from '../components/charts/IELTSRadarChart';
import clsx from 'clsx';

const Analysis: React.FC = () => {
    const { getDailyHeat, activityLog, ielts, dailyHistory } = useDragonStore();
    const dailyData = getDailyHeat();

    // Calculate total Heat (Productivity)
    const totalHeat = activityLog.reduce((acc, log) => acc + log.amount, 0);

    // Identify Weakest Skill
    const skills = [
        { name: 'Listening', score: ielts.listening },
        { name: 'Reading', score: ielts.reading },
        { name: 'Writing', score: ielts.writing },
        { name: 'Speaking', score: ielts.speaking }
    ];
    const weakestSkill = skills.reduce((min, skill) => skill.score < min.score ? skill : min, skills[0]);

    // Calculate Colors based on band
    const getBandColor = (score: number) => {
        if (score >= 8) return "text-emerald-600 bg-emerald-100";
        if (score >= 6.5) return "text-blue-600 bg-blue-100";
        if (score >= 5) return "text-amber-600 bg-amber-100";
        return "text-rose-600 bg-rose-100";
    };

    // Calculate top blockers
    const blockerCounts = dailyHistory.flatMap(d => d.blockers || []).reduce((acc, b) => {
        acc[b] = (acc[b] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topBlockers = Object.entries(blockerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Activity className="text-indigo-500" />
                        The Architect's Table
                    </h1>
                    <p className="text-slate-500 mt-1">"Measure thy worth, realize thy potential."</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Overall Band</div>
                        <div className="text-4xl font-bold text-slate-800">{ielts.overall}</div>
                    </div>
                    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl", getBandColor(ielts.overall))}>
                        {ielts.overall}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Soul Geometry (Radar Chart) */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full opacity-50" />

                    <h3 className="w-full text-slate-800 font-bold text-lg flex items-center gap-2 mb-6 z-10">
                        <Target className="text-indigo-500" size={20} /> Soul Geometry
                    </h3>

                    <div className="relative z-10 w-full flex justify-center py-4">
                        <IELTSRadarChart data={ielts} target={8.0} />
                    </div>

                    {/* Weakness Targeting Alert */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-6 w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between z-10"
                    >
                        <div>
                            <div className="text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">Critical Weakness</div>
                            <div className="text-slate-800 font-medium">{weakestSkill.name} (Band {weakestSkill.score})</div>
                        </div>
                        <button className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl shadow-rose-200 flex items-center gap-2 text-sm transition-all">
                            <Sword size={16} /> Train
                        </button>
                    </motion.div>
                </div>

                {/* Blocker Insights */}
                {topBlockers.length > 0 && (
                    <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <h3 className="w-full text-slate-800 font-bold text-lg flex items-center gap-2 mb-6 z-10">
                            <AlertTriangle className="text-amber-500" size={20} /> Enemy Intel
                        </h3>
                        <div className="space-y-4">
                            {topBlockers.map(([blocker, count]) => (
                                <div key={blocker} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <span className="font-bold text-slate-700">{blocker}</span>
                                    <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                                        x{count}
                                    </span>
                                </div>
                            ))}
                            <p className="text-xs text-slate-400 mt-4 italic text-center">
                                "Know your enemy, and you need not fear the result of a hundred battles."
                            </p>
                        </div>
                    </div>
                )}

                {/* Right Column: Heat & History */}
                <div className="flex flex-col gap-6">
                    {/* Heat Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 mb-3">
                                <Sparkles size={20} />
                            </div>
                            <div className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Total Heat</div>
                            <div className="text-3xl font-bold text-slate-800">{totalHeat.toLocaleString()} 🔥</div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500 mb-3">
                                <Calendar size={20} />
                            </div>
                            <div className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Consistency</div>
                            <div className="text-3xl font-bold text-slate-800">{new Set(activityLog.map(l => l.date)).size} Days</div>
                        </div>
                    </div>

                    {/* Weekly Chart */}
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BarChart className="text-indigo-500" size={20} /> Frequency Resonance
                        </h3>
                        <div className="h-40 flex items-end gap-2">
                            {dailyData.map((amount, index) => {
                                const heightPercent = Math.min(100, Math.max(5, (amount / 1000) * 100));
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPercent}%` }}
                                            className={clsx(
                                                "w-full rounded-t-lg transition-all",
                                                index === 6 ? 'bg-indigo-500 shadow-lg shadow-indigo-200' : 'bg-slate-100 group-hover:bg-slate-200'
                                            )}
                                        />
                                        <span className={clsx("text-[10px] font-bold", index === 6 ? "text-indigo-500" : "text-slate-400")}>
                                            {index === 6 ? 'Today' : `-${6 - index}d`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Logs (List) */}
                    <div className="flex-1 overflow-hidden flex flex-col bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar className="text-indigo-500" size={20} /> Recent Inscriptions
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {activityLog.slice(-10).reverse().map((log, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("w-2 h-2 rounded-full", log.source.includes('IELTS') ? 'bg-indigo-500' : 'bg-slate-400')} />
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 text-sm font-bold">{log.source.replace('IELTS_', '').replace('_', ' ')}</span>
                                            <span className="text-[10px] text-slate-400">{log.date}</span>
                                        </div>
                                    </div>
                                    <span className="text-orange-500 font-bold text-sm">+{log.amount}</span>
                                </div>
                            ))}
                            {activityLog.length === 0 && (
                                <div className="text-slate-400 text-sm text-center py-4">The scroll is blank. Begin your journey.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
