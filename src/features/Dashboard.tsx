import React, { useState } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import type { DaySummary } from '../logic/dragonStore';
import {
    CheckCircle, Flame, Target, Trophy, Calendar, Moon, Sparkles,
    Clock, AlertTriangle, ArrowRight, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../logic/GeminiService';
import { calendarService, type CalendarEvent } from '../logic/calendarService';
import clsx from 'clsx';

const StatCard: React.FC<{
    label: string, value: string | number, icon: any, color: string, bg: string, subtext?: string
}> = ({ label, value, icon: Icon, color, bg, subtext }) => (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105">
        <div className={`p - 4 rounded - 2xl ${bg} ${color} mb - 2`}>
            <Icon size={24} />
        </div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
        {subtext && <div className="text-[10px] text-slate-400 font-medium">{subtext}</div>}
    </div>
);

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
        updateSchedule
    } = useDragonStore();

    React.useEffect(() => {
        if (schedule.length === 0) generateSchedule();
    }, [schedule.length, generateSchedule]);

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Calendar State
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
        return events;
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

    const syncCalendar = async () => {
        try {
            // Assuming listUpcomingEvents is meant to be fetchCalendarEvents based on existing code
            const events = await fetchCalendarEvents();
            if (events) setCalendarEvents(events);
        } catch (error) {
            console.error("Failed to sync calendar:", error);
        }
    };

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
        setIsBlockerModalOpen(false);
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
                recommendation_next_day: result.recommendation || "Rest well.",
                blockers: blockers
            };
            recordDaySummary(summary);
            alert(`Analysis Complete.Score: ${result.score} `);
        }
        setIsAnalyzing(false);
    };

    // ... (rest of the file) ...

    const handleBlockerSubmit = () => {
        if (!blockerInput) return;
        performEndDayAnalysis([blockerInput]);
        setBlockerInput("");
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

    // Timeline Logic
    const timelineItems = [
        ...calendarEvents.map(e => ({
            id: e.id,
            time: new Date(e.start.dateTime || e.start.date || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: e.summary,
            type: 'CALENDAR',
            original: e,
            details: ''
        })),
        ...schedule.map((s, i) => ({
            id: `sched - ${i} `,
            time: s.time,
            title: s.activity,
            type: s.type,
            details: s.details || ''
        }))
    ].sort((a, b) => {
        return a.time.localeCompare(b.time);
    });

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-32">
            {/* Header Section */}
            <header className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
                            {greeting}, {userProfile?.name || "Keeper"}
                        </span>
                        <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 5 }}>
                            👋
                        </motion.span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 ml-1 flex items-center gap-3">
                        {isCalendarConnected ? (
                            <>
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                    <CheckCircle size={12} /> Synced
                                </span>
                                <button
                                    onClick={syncCalendar}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                                    title="Sync Calendar"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </>
                        ) : (
                            <button onClick={handleConnectCalendar} className="text-indigo-600 hover:underline text-xs font-bold flex items-center gap-1">
                                <Calendar size={12} /> Connect Google Calendar
                            </button>
                        )}
                        <span>•</span>
                        <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    {/* Heat Widget */}
                    <div className="text-right">
                        <div className="text-xs text-orange-400 font-bold uppercase tracking-widest">Daily Heat</div>
                        <div className="text-3xl font-bold text-orange-500 flex items-center justify-end gap-1">
                            {todayHeat} <Flame size={24} className="fill-orange-500" />
                        </div>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-0 opacity-50" />
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: The Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm min-h-[500px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-b from-white to-transparent z-10" />

                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="text-indigo-500" /> Time Stream
                            </h2>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {timelineItems.length} Events
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10 px-2">
                            {/* Vertical Line */}
                            <div className="absolute left-[4.5rem] top-4 bottom-4 w-0.5 bg-slate-100" />

                            {timelineItems.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 italic">
                                    "The scroll is blank. Visit the Morning Ritual to forge your day."
                                </div>
                            ) : (
                                timelineItems.map((item, idx) => (
                                    <div key={idx} className="relative flex group">
                                        <div className="w-16 pt-3 text-right text-xs font-bold text-slate-400 font-mono">
                                            {item.time}
                                        </div>
                                        <div className="w-8 flex justify-center pt-2 relative z-10">
                                            <div className={clsx(
                                                "w-3 h-3 rounded-full border-2 bg-white transition-colors",
                                                item.type === 'CALENDAR' ? 'border-blue-400 group-hover:bg-blue-400' :
                                                    item.type === 'MEAL' ? 'border-orange-400 group-hover:bg-orange-400' :
                                                        item.type === 'WORK' ? 'border-amber-400 group-hover:bg-amber-400' :
                                                            'border-indigo-400 group-hover:bg-indigo-400'
                                            )} />
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className={clsx(
                                                "p-4 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer relative overflow-hidden",
                                                item.type === 'CALENDAR' ? 'bg-slate-50 border-slate-300 text-slate-500' :
                                                    item.type === 'MEAL' ? 'bg-orange-50 border-orange-100 text-orange-900' :
                                                        item.type === 'WORK' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                                                            'bg-white border-slate-100 text-slate-800'
                                            )}>
                                                <div className="font-bold flex justify-between items-start">
                                                    <span>{item.title}</span>
                                                    {item.type === 'CALENDAR' && <Calendar size={14} className="opacity-50" />}
                                                </div>
                                                {item.details && (
                                                    <div className="text-xs opacity-70 mt-1 truncate">{item.details}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Panic Button & Tasks */}
                <div className="space-y-6">
                    {/* Panic Widget */}
                    <button
                        onClick={() => setIsPanicOpen(true)}
                        className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 p-6 rounded-[32px] flex items-center justify-between group transition-all"
                    >
                        <div className="text-left">
                            <div className="font-bold text-lg">Off Track?</div>
                            <div className="text-xs opacity-70">Emergency Reschedule</div>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <AlertTriangle className="fill-rose-500 text-rose-500" />
                        </div>
                    </button>

                    {/* Pending Tasks (Dragon Core) */}
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col max-h-[500px]">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Target className="text-indigo-500" /> Core Objectives
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {pendingTasks.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">All clear. Excellent work.</div>
                            ) : (
                                pendingTasks.map(task => (
                                    <div key={task.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer" onClick={() => toggleTask(task.id)}>
                                        <div className={clsx(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                                            task.completed ? "bg-indigo-500 border-indigo-500" : "border-slate-300"
                                        )}>
                                            {task.completed && <CheckCircle size={12} className="text-white" />}
                                        </div>
                                        <div>
                                            <div className={clsx("text-sm font-bold", task.completed ? "text-slate-400 line-through" : "text-slate-700")}>{task.title}</div>
                                            <div className="text-xs text-slate-400 mt-1">{task.type} • Rank {task.rank}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Habits */}
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Trophy className="text-amber-500" /> Daily Rituals
                        </h3>
                        <div className="space-y-2">
                            {habits.map(habit => (
                                <div key={habit.id} className="flex justify-between items-center p-3 hover:bg-amber-50 rounded-xl cursor-pointer transition-colors group" onClick={() => triggerHabit(habit.id)}>
                                    <span className="text-sm font-bold text-slate-700">{habit.title}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-bold text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full group-hover:bg-amber-200 transition-colors">
                                            🔥 {habit.streak}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* End Day Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleEndDay}
                    disabled={isAnalyzing}
                    className="bg-slate-900 text-white px-6 py-4 rounded-full font-bold shadow-xl hover:bg-black hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? <Sparkles size={18} className="animate-spin" /> : <Moon size={18} />}
                    {isAnalyzing ? "Analyzing..." : "End Day & Analyze"}
                </button>
            </div>

            {/* Panic Modal */}
            <AnimatePresence>
                {isPanicOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsPanicOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-rose-600 mb-2 flex items-center gap-2">
                                <AlertTriangle /> Panic Mode
                            </h2>
                            <p className="text-slate-500 mb-6">"Even the best laid plans falter. Tell me, what has changed?"</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">New Available Time</label>
                                    <input
                                        type="time"
                                        value={panicTime}
                                        onChange={e => setPanicTime(e.target.value)}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Reason for Delay</label>
                                    <textarea
                                        value={panicReason}
                                        onChange={e => setPanicReason(e.target.value)}
                                        placeholder="e.g. Unexpected meeting, got sick, overslept..."
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[100px]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={() => setIsPanicOpen(false)}
                                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePanicSubmit}
                                    disabled={isReplanning || !panicTime || !panicReason}
                                    className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isReplanning ? <Sparkles size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                                    {isReplanning ? "Recalculating..." : "Reschedule Now"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Blocker Modal */}
            <AnimatePresence>
                {isBlockerModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Unfinished Business</h2>
                            <p className="text-slate-500 mb-6">"Honesty is the first step to improvement. What stood in your way today?"</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {COMMON_BLOCKERS.map(b => (
                                    <button
                                        key={b}
                                        onClick={() => setBlockerInput(b)}
                                        className={`px - 3 py - 1 rounded - full text - xs font - bold border transition - colors ${blockerInput === b ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'} `}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={blockerInput}
                                onChange={e => setBlockerInput(e.target.value)}
                                placeholder="Or describe it yourself..."
                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] mb-6"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => performEndDayAnalysis([])} // Skip logic
                                    className="px-4 py-2 text-slate-400 font-bold hover:text-slate-600 text-sm"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleBlockerSubmit}
                                    disabled={!blockerInput}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    Submit & Analyze
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Dashboard;
