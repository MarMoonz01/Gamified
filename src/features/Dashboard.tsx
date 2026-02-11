import React, { useState } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import type { DaySummary } from '../logic/dragonStore';
import { CheckCircle, Flame, Target, Trophy, Calendar, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../logic/GeminiService';

const Dashboard: React.FC = () => {
    const {
        essence,
        tasks, habits,
        getDailyHeat,
        toggleTask, triggerHabit,
        userProfile,
        recordDaySummary
    } = useDragonStore();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<DaySummary | null>(null);

    const dailyHeat = getDailyHeat();
    const todayHeat = dailyHeat[6] || 0;
    const pendingTasks = tasks.filter(t => !t.completed && (!t.expiresAt || t.expiresAt > Date.now()));

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    const handleEndDay = async () => {
        setIsAnalyzing(true);
        const result = await geminiService.generateDailyAnalysis(
            userProfile || { name: "Keeper" },
            tasks,
            habits,
            todayHeat
        );

        if (result) {
            const summary: DaySummary = {
                date: new Date().toISOString().split('T')[0],
                completed_tasks: tasks.filter(t => t.completed).length,
                total_tasks: tasks.length,
                heat_earned: todayHeat,
                mood: result.mood,
                ai_analysis: result.analysis
            };
            recordDaySummary(summary);
            setAnalysisResult(summary);
        }
        setIsAnalyzing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 relative">
            {/* --- Header Section --- */}
            <header className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-[#E8EFE8] shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-[#354F52]">{greeting}, {userProfile?.name || "Keeper"}.</h1>
                    <p className="text-[#84A98C] mt-1 font-medium">Ready to seize the day?</p>
                </div>
                <button
                    onClick={handleEndDay}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-[#52796F] text-white px-6 py-3 rounded-2xl hover:bg-[#354F52] transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                    {isAnalyzing ? <Sparkles className="animate-spin" /> : <Moon size={20} />}
                    {isAnalyzing ? "Consulting Stars..." : "End Day & Reflect"}
                </button>
            </header>

            {/* --- Top Stats Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="Daily Heat"
                    value={todayHeat}
                    icon={Flame}
                    color="text-[#E9C46A]"
                    bg="bg-[#FFF8E1]"
                    subtext="/ 1000 Target"
                />
                <StatCard
                    label="Pending Tasks"
                    value={pendingTasks.length}
                    icon={Target}
                    color="text-[#52796F]"
                    bg="bg-[#E8F5E9]"
                    subtext="Keep going!"
                />
                <StatCard
                    label="Total Essence"
                    value={essence}
                    icon={Trophy}
                    color="text-[#D4A373]"
                    bg="bg-[#FDF3E7]"
                    subtext="Available to spend"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- Tasks Column --- */}
                <section className="widget-card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#354F52] flex items-center gap-2">
                            <CheckCircle size={24} className="text-[#84A98C]" />
                            Priority Tasks
                        </h2>
                        <span className="text-xs font-bold px-3 py-1 bg-[#E8EFE8] text-[#52796F] rounded-full">
                            {pendingTasks.length} Remaining
                        </span>
                    </div>

                    <div className="space-y-3">
                        {pendingTasks.length === 0 ? (
                            <div className="text-center py-12 text-[#84A98C] italic">
                                All stats clear. Enjoy your rest.
                            </div>
                        ) : (
                            pendingTasks.slice(0, 5).map(task => (
                                <motion.div
                                    key={task.id}
                                    layoutId={task.id}
                                    className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-[#F7F9F6] border border-transparent hover:border-[#E8EFE8] transition-all cursor-pointer"
                                    onClick={() => toggleTask(task.id)}
                                >
                                    <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-[#52796F] border-[#52796F]' : 'border-[#BCCEC0] group-hover:border-[#52796F]'}`}>
                                        {task.completed && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-base font-bold text-[#354F52] group-hover:text-[#2F3E46] transition-colors leading-tight">
                                            {task.title}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-[10px] uppercase font-bold text-[#84A98C] tracking-wider bg-[#E8EFE8] px-2 py-0.5 rounded-lg">
                                                {task.type}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </section>

                {/* --- Habits / Quick Actions Column --- */}
                <section className="widget-card">
                    <h2 className="text-xl font-bold text-[#354F52] mb-6 flex items-center gap-2">
                        <Calendar size={24} className="text-[#84A98C]" />
                        Habit Streaks
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {habits.slice(0, 4).map(habit => (
                            <button
                                key={habit.id}
                                onClick={() => triggerHabit(habit.id)}
                                className="flex flex-col items-center p-6 rounded-2xl border border-[#E8EFE8] bg-[#F7F9F6] hover:bg-white hover:shadow-md hover:border-[#D8E6D8] transition-all group text-center"
                            >
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                                    {habit.type === 'HEALTH' ? '🥬' : habit.type === 'STUDY' ? '📖' : '✨'}
                                </div>
                                <span className="text-sm font-bold text-[#354F52] line-clamp-1">
                                    {habit.title}
                                </span>
                                <span className="text-xs text-[#84A98C] mt-1 font-medium">
                                    {habit.streak} day streak
                                </span>
                            </button>
                        ))}
                        {habits.length === 0 && (
                            <div className="col-span-2 text-center text-[#84A98C] text-sm py-4">
                                No habits tracked. Add some in the Hatchery.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* --- Analysis Modal --- */}
            <AnimatePresence>
                {analysisResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl border border-[#E8EFE8] text-center"
                        >
                            <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                                🌙
                            </div>
                            <h2 className="text-2xl font-bold text-[#354F52] mb-2">Day Complete!</h2>
                            <p className="text-[#84A98C] font-bold text-sm uppercase tracking-widest mb-6">
                                Mood: {analysisResult.mood}
                            </p>

                            <div className="bg-[#F7F9F6] p-6 rounded-2xl text-[#354F52] italic leading-relaxed mb-8">
                                "{analysisResult.ai_analysis}"
                            </div>

                            <button
                                onClick={() => setAnalysisResult(null)}
                                className="w-full py-3 bg-[#52796F] text-white font-bold rounded-xl hover:bg-[#354F52] transition-all"
                            >
                                Rest Well
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard: React.FC<{ label: string, value: number | string, icon: any, color: string, bg?: string, subtext?: string }> = ({ label, value, icon: Icon, color, bg = 'bg-slate-50', subtext }) => (
    <div className="widget-card flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
            <Icon size={28} />
        </div>
        <div>
            <p className="text-[#84A98C] text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#354F52]">{typeof value === 'number' ? value.toLocaleString() : value}</span>
            </div>
            {subtext && <p className="text-xs text-[#84A98C] opacity-80">{subtext}</p>}
        </div>
    </div>
);

export default Dashboard;
