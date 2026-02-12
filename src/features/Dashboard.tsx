import React, { useState } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import type { DaySummary } from '../logic/dragonStore';
import { CheckCircle, Flame, Target, Trophy, Calendar, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../logic/GeminiService';
import { calendarService, type CalendarEvent } from '../logic/calendarService';

const Dashboard: React.FC = () => {
    const {
        essence,
        tasks, habits,
        getDailyHeat,
        toggleTask, triggerHabit,
        userProfile,
        recordDaySummary,
        dailyHistory,
        schedule,
        generateSchedule,

        updateSchedule,
        toggleScheduleItem
    } = useDragonStore();

    React.useEffect(() => {
        if (schedule.length === 0) generateSchedule();
    }, [schedule.length, generateSchedule]);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<DaySummary | null>(null);

    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);

    // Panic Mode State
    const [isPanicOpen, setIsPanicOpen] = useState(false);
    const [panicTime, setPanicTime] = useState("");
    const [panicReason, setPanicReason] = useState("");
    const [isReplanning, setIsReplanning] = useState(false);

    // Blocker Analysis State
    const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
    const [blockerInput, setBlockerInput] = useState("");
    const COMMON_BLOCKERS = ["Too Tired", "Distracted", "Ran out of time", "Too Hard", "Procrastination", "Technical Issues"];

    React.useEffect(() => {
        checkCalendarConnection();
    }, []);

    const checkCalendarConnection = async () => {
        const session = await calendarService.getSession();
        if (session?.provider_token) {
            setIsCalendarConnected(true);
            fetchCalendarEvents();
        }
    };

    const fetchCalendarEvents = async () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const events = await calendarService.fetchEvents(start, end);
        setCalendarEvents(events);
    };

    const handleConnectCalendar = async () => {
        await calendarService.signInWithGoogle();
    };

    const dailyHeat = getDailyHeat();
    const todayHeat = dailyHeat[6] || 0;
    const pendingTasks = tasks.filter(t => !t.completed && (!t.expiresAt || t.expiresAt > Date.now()));

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    const handleEndDay = async () => {
        const hasIncomplete = tasks.some(t => !t.completed && (!t.expiresAt || t.expiresAt > Date.now()));
        if (hasIncomplete) {
            setIsBlockerModalOpen(true);
            return;
        }
        await performEndDayAnalysis([]);
    };

    const performEndDayAnalysis = async (blockers: string[]) => {
        setIsAnalyzing(true);
        setIsBlockerModalOpen(false); // Close blocker modal if open
        const result = await geminiService.generateDailyAnalysis(
            userProfile || { name: "Keeper" },
            tasks,
            habits,
            todayHeat,
            blockers,
            dailyHistory
        );

        if (result) {
            const summary: DaySummary = {
                date: new Date().toISOString().split('T')[0],
                completed_tasks: tasks.filter(t => t.completed).length,
                total_tasks: tasks.length,
                heat_earned: todayHeat,
                mood: result.mood,
                ai_analysis: result.analysis,
                score: result.score || 0,
                recommendation_next_day: result.recommendation || "Rest well and prepare for tomorrow.",
                blockers: blockers
            };
            recordDaySummary(summary);
            setAnalysisResult(summary);
        }
        setIsAnalyzing(false);
    };

    const handlePanicSubmit = async () => {
        if (!panicTime || !panicReason) return;
        setIsReplanning(true);
        try {
            const result = await geminiService.replanSchedule(schedule, panicTime, panicReason, userProfile);
            if (result && result.schedule) {
                updateSchedule(result.schedule);
                setIsPanicOpen(false);
                setPanicTime("");
                setPanicReason("");
                alert(`Elder Ignis: "${result.rationale}"`);
            }
        } catch (e) {
            alert("Failed to replan. The stars are silent.");
        } finally {
            setIsReplanning(false);
        }
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

            {/* Daily Secretary Widget */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Calendar size={120} className="text-slate-800" />
                </div>

                <div className="flex justify-between items-center mb-4 relative z-10">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle size={20} className="text-amber-600" /> Daily Briefing
                    </h2>
                    {!isCalendarConnected && (
                        <button
                            onClick={handleConnectCalendar}
                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-200 transition"
                        >
                            Sync Google Calendar
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    {/* Render Calendar Events First (Blocked Time) */}
                    {calendarEvents.map(event => (
                        <div
                            key={event.id}
                            className="p-4 rounded-lg border-2 border-slate-200 bg-slate-100 opacity-75"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-300 text-slate-700">
                                    GOOGLE
                                </span>
                                <span className="text-xs font-mono text-slate-500">
                                    {new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="font-medium text-slate-500 line-through decoration-slate-400">
                                {event.summary}
                            </div>
                        </div>
                    ))}

                    {schedule.map(item => (
                        <div
                            key={item.id}
                            onClick={() => toggleScheduleItem(item.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${item.completed ? 'bg-green-50/50 border-green-200 opacity-60' : 'bg-slate-50 border-slate-200 hover:border-amber-400'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${item.type === 'STUDY' ? 'bg-blue-100 text-blue-700' :
                                    item.type === 'HEALTH' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>{item.type}</span>
                                <span className="text-xs font-mono text-slate-400">{item.time}</span>
                            </div>
                            <div className={`font-medium text-slate-700 ${item.completed ? 'line-through' : ''}`}>
                                {item.activity}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => setIsPanicOpen(true)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline uppercase tracking-wider"
                    >
                        Request Reschedule (Emergency)
                    </button>
                </div>
            </motion.div>

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
                {isPanicOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#2C1810] rounded-xl p-8 max-w-md w-full shadow-2xl border-2 border-red-900/50"
                        >
                            <div className="flex items-center gap-3 mb-6 text-red-500">
                                <Flame size={32} className="animate-pulse" />
                                <h2 className="text-2xl font-medieval text-red-500">Emergency Protocol</h2>
                            </div>

                            <p className="text-[#D7C4A1] mb-6 text-sm">
                                "Do not fear chaos, Keeper. Tell me what happened, and I shall weave a new path."
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-red-400 font-bold uppercase tracking-widest block mb-2">Time Lost</label>
                                    <input
                                        type="text"
                                        value={panicTime}
                                        onChange={e => setPanicTime(e.target.value)}
                                        placeholder="e.g. 2 hours, 30 mins"
                                        className="w-full bg-black/30 border border-red-900/50 rounded-lg p-3 text-[#D7C4A1] focus:border-red-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-red-400 font-bold uppercase tracking-widest block mb-2">Reason</label>
                                    <input
                                        type="text"
                                        value={panicReason}
                                        onChange={e => setPanicReason(e.target.value)}
                                        placeholder="e.g. Overslept, Unexpected Errand"
                                        className="w-full bg-black/30 border border-red-900/50 rounded-lg p-3 text-[#D7C4A1] focus:border-red-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setIsPanicOpen(false)}
                                    className="flex-1 py-3 text-[#8D6E63] hover:text-[#D7C4A1] transition font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePanicSubmit}
                                    disabled={isReplanning || !panicTime || !panicReason}
                                    className="flex-[2] bg-red-900/80 hover:bg-red-800 text-red-100 py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(153,27,27,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isReplanning ? <Sparkles size={16} className="animate-spin" /> : <Target size={16} />}
                                    {isReplanning ? "Recalculating..." : "Fix My Day"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* --- Blocker Modal --- */}
                {isBlockerModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1A2F33] rounded-xl p-8 max-w-md w-full shadow-2xl border-2 border-[#52796F]"
                        >
                            <h2 className="text-xl font-bold text-[#E8EFE8] mb-2">Unfinished Business...</h2>
                            <p className="text-[#84A98C] text-sm mb-6">
                                "Wisdom comes from understanding our failures. What held you back today?"
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {COMMON_BLOCKERS.map(reason => (
                                    <button
                                        key={reason}
                                        onClick={() => setBlockerInput(prev => prev ? `${prev}, ${reason}` : reason)}
                                        className="text-xs bg-[#2F3E46] text-[#CAD2C5] px-3 py-1.5 rounded-full hover:bg-[#52796F] transition"
                                    >
                                        + {reason}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={blockerInput}
                                onChange={e => setBlockerInput(e.target.value)}
                                placeholder="Describe the obstacle..."
                                className="w-full bg-[#0F1C20] border border-[#2F3E46] rounded-lg p-3 text-[#E8EFE8] focus:border-[#52796F] outline-none h-24 mb-6"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => performEndDayAnalysis([])} // Skip/None
                                    className="flex-1 py-3 text-[#84A98C] hover:text-[#E8EFE8] transition font-bold text-sm"
                                >
                                    Skip Analysis
                                </button>
                                <button
                                    onClick={() => performEndDayAnalysis([blockerInput])}
                                    disabled={!blockerInput.trim()}
                                    className="flex-[2] bg-[#52796F] hover:bg-[#354F52] text-white py-3 rounded-lg font-bold shadow-lg disabled:opacity-50"
                                >
                                    Submit & Reflect
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

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
