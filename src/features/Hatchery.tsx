import React, { useState, useEffect } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import type { Habit } from '../logic/dragonStore';
import DynamicEgg from '../components/DynamicEgg';
import PixelDragon from '../components/PixelDragon';
import { CheckCircle, Plus, Trash2, BookOpen, Mic, PenTool, Headphones, Zap, Sword, Book, Music, Heart, ArrowUpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../logic/soundStore';
import MorningRitual from './MorningRitual';

const Hatchery: React.FC = () => {
    const {
        activeEgg, dragons,
        addHeat, hatchEgg, startNewEgg,
        habits, tasks, addHabit, triggerHabit, deleteHabit, addTask, toggleTask, deleteTask,
        feedDragon, trainDragon, evolveDragon
    } = useDragonStore();
    const { playSound } = useSound();
    const [activeTab, setActiveTab] = useState<'FUEL' | 'FOCUS'>('FUEL');
    const [showMorningRitual, setShowMorningRitual] = useState(false);

    // Focus Mode State
    const [focusSubject, setFocusSubject] = useState<'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING' | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins

    // Mock Timer Logic
    useEffect(() => {
        let interval: any;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            if (focusSubject) {
                // Determine source string
                const source = `IELTS_${focusSubject}`;
                addHeat(200, source); // Big boost for finishing session
                alert("Ritual Complete! The egg glows with knowledge.");
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, focusSubject, addHeat]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Forms
    const [showAddModal, setShowAddModal] = useState<'HABIT' | 'TASK' | null>(null);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemType, setNewItemType] = useState<Habit['type']>('HEALTH');

    const handleAddItem = () => {
        if (!newItemTitle.trim()) return;
        if (showAddModal === 'HABIT') {
            addHabit(newItemTitle, newItemType);
        } else {
            // Task type cannot be 'BOTH', default to 'GOLD' if so
            const taskType = newItemType === 'BOTH' ? 'GOLD' : newItemType;
            addTask(newItemTitle, taskType, 'E'); // Default rank E
        }
        playSound('CLICK');
        setNewItemTitle('');
        setShowAddModal(null);
    };

    if (!activeEgg) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-8">
                <h1 className="text-4xl font-medieval text-sky-900">The Incubator is Empty</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => { startNewEgg('COMMON'); playSound('CLICK'); }}
                        className="px-6 py-3 bg-slate-200 rounded-xl hover:bg-slate-300 font-bold text-slate-700 transition"
                    >
                        Common Egg (500 Heat)
                    </button>
                    <button
                        onClick={() => { startNewEgg('RARE'); playSound('CLICK'); }}
                        className="px-6 py-3 bg-blue-100 border border-blue-300 rounded-xl hover:bg-blue-200 font-bold text-blue-700 transition"
                    >
                        Rare Egg (2500 Heat)
                    </button>
                </div>
            </div>
        );
    }


    // Dragon Management State
    const [selectedDragonId, setSelectedDragonId] = useState<string | null>(null);
    useEffect(() => {
        if (dragons.length > 0 && !selectedDragonId) {
            setSelectedDragonId(dragons[0].id);
        }
    }, [dragons]);

    const activeDragon = dragons.find(d => d.id === selectedDragonId);

    // ... existing formatTime ...

    if (!activeEgg && dragons.length === 0) {
        // ... Empty State (Start New Egg) ...
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-8">
                <h1 className="text-4xl font-medieval text-sky-900">The Incubator is Empty</h1>
                <div className="flex gap-4">
                    <button onClick={() => { startNewEgg('COMMON'); playSound('CLICK'); }} className="px-6 py-3 bg-slate-200 rounded-xl hover:bg-slate-300 font-bold text-slate-700 transition">Common Egg (500 Heat)</button>
                    <button onClick={() => { startNewEgg('RARE'); playSound('CLICK'); }} className="px-6 py-3 bg-blue-100 border border-blue-300 rounded-xl hover:bg-blue-200 font-bold text-blue-700 transition">Rare Egg (2500 Heat)</button>
                </div>
            </div>
        );
    }

    // MAIN RENDER
    return (
        <div className="w-full h-full flex gap-8">
            {/* LEFT: Dashboard (Fuel vs Focus) - SAME AS BEFORE */}
            <div className="w-1/3 h-full flex flex-col gap-4">
                {/* ... Tabs & Lists (Habits/Tasks/Focus) ... */}
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('FUEL')} className={`flex-1 py-2 font-medieval font-bold rounded-t-sm transition-colors border-2 border-b-0 ${activeTab === 'FUEL' ? 'bg-[#FDF6E3] border-[#5D4037] text-[#2C1810]' : 'bg-black/10 border-transparent text-amber-900/50 hover:bg-black/20'}`}>DAILY FUEL</button>
                    <button onClick={() => setActiveTab('FOCUS')} className={`flex-1 py-2 font-medieval font-bold rounded-t-sm transition-colors border-2 border-b-0 ${activeTab === 'FOCUS' ? 'bg-[#FDF6E3] border-[#5D4037] text-[#2C1810]' : 'bg-black/10 border-transparent text-amber-900/50 hover:bg-black/20'}`}>IELTS RITUAL</button>
                </div>

                <div className="glass-panel p-6 flex-1 min-h-0 overflow-y-auto relative rounded-t-none mt-[-2px] custom-scrollbar">
                    {activeTab === 'FUEL' ? (
                        <>
                            {/* AI Secretary Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => setShowMorningRitual(true)}
                                className="w-full mb-6 py-3 bg-gradient-to-r from-[#2C1810] to-[#5D4037] text-[#D4AF37] border-2 border-[#D4AF37] rounded-lg font-medieval shadow-lg flex items-center justify-center gap-2"
                            >
                                <Sparkles size={18} /> CONSULT ELDER IGNIS <Sparkles size={18} />
                            </motion.button>

                            {/* HABITS */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-[#8B4513] uppercase tracking-wider font-medieval">Habits (Food)</h3>
                                    <button onClick={() => setShowAddModal('HABIT')} className="p-1 rounded bg-green-100 hover:bg-green-200 text-green-800 border border-green-300"><Plus size={16} /></button>
                                </div>
                                <div className="space-y-2">
                                    {habits.map(habit => (
                                        <div key={habit.id} className="flex items-center justify-between p-3 bg-[#FDF6E3]/50 rounded-sm border border-[#D7C4A1] hover:bg-white/40 transition">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => triggerHabit(habit.id)} className="w-8 h-8 rounded-full bg-green-100 border border-green-300 hover:bg-green-200 flex items-center justify-center text-green-700 transition-colors shadow-sm"><Zap size={16} /></button>
                                                <div>
                                                    <div className="font-bold text-[#2C1810]">{habit.title}</div>
                                                    <div className="text-xs text-[#5D4037]">Streak: {habit.streak} 🔥</div>
                                                </div>
                                            </div>
                                            <button onClick={() => deleteHabit(habit.id)} className="text-[#D7C4A1] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TASKS */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-[#8B4513] uppercase tracking-wider font-medieval">Tasks (Gold)</h3>
                                    <button onClick={() => setShowAddModal('TASK')} className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300"><Plus size={16} /></button>
                                </div>
                                <div className="space-y-2">
                                    {tasks.map(task => (
                                        <div key={task.id} className={`flex items-center justify-between p-3 rounded-sm border transition-all ${task.completed ? 'bg-black/5 border-transparent opacity-60' : 'bg-[#FDF6E3]/50 border-[#D7C4A1] hover:bg-white/40'}`}>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'border-[#D7C4A1] hover:border-[#D4AF37] bg-white/50'}`}>{task.completed && <CheckCircle size={14} />}</button>
                                                <div className={`font-bold ${task.completed ? 'line-through text-amber-900/40' : 'text-[#2C1810]'}`}>{task.title}</div>
                                            </div>
                                            <button onClick={() => deleteTask(task.id)} className="text-[#D7C4A1] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        // FOCUS MODE (Same as before)
                        <div className="flex flex-col items-center h-full gap-6">
                            <h2 className="system-header text-center w-full">IELTS Focus Ritual</h2>
                            {!isTimerRunning ? (
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <FocusButton active={focusSubject === 'READING'} onClick={() => setFocusSubject('READING')} icon={BookOpen} label="Reading" color="text-purple-600" />
                                    <FocusButton active={focusSubject === 'LISTENING'} onClick={() => setFocusSubject('LISTENING')} icon={Headphones} label="Listening" color="text-blue-600" />
                                    <FocusButton active={focusSubject === 'WRITING'} onClick={() => setFocusSubject('WRITING')} icon={PenTool} label="Writing" color="text-red-800" />
                                    <FocusButton active={focusSubject === 'SPEAKING'} onClick={() => setFocusSubject('SPEAKING')} icon={Mic} label="Speaking" color="text-amber-600" />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl font-medieval font-bold text-[#2C1810]">{formatTime(timeLeft)}</motion.div>
                                    <div className="mt-4 text-[#5D4037] font-medieval uppercase tracking-widest">Focusing on {focusSubject}</div>
                                </div>
                            )}
                            <div className="mt-auto w-full">
                                {isTimerRunning ? (
                                    <button onClick={() => setIsTimerRunning(false)} className="w-full py-4 rounded-sm border-2 border-red-900/20 text-red-800 hover:bg-red-50 bg-[#FAEBEB] font-bold font-medieval tracking-widest">CANCEL RITUAL</button>
                                ) : (
                                    <button disabled={!focusSubject} onClick={() => setIsTimerRunning(true)} className={`w-full py-4 rounded-sm font-bold transition-all font-medieval tracking-widest border-2 ${focusSubject ? 'bg-[#2C1810] text-[#D4AF37] border-[#D4AF37] hover:bg-black shadow-lg' : 'bg-slate-200 text-slate-400 border-transparent cursor-not-allowed'}`}>BEGIN 25m SESSION</button>
                                )}
                            </div>
                        </div>
                    )}
                    <AnimatePresence>
                        {showMorningRitual && <MorningRitual onClose={() => setShowMorningRitual(false)} />}
                        {showAddModal && (
                            <motion.div className="absolute inset-0 bg-[#FDF6E3]/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 rounded-2xl">
                                <h3 className="font-medieval text-xl text-[#2C1810] mb-4">Add New {showAddModal}</h3>
                                <input autoFocus className="w-full p-3 rounded-sm border-b-2 border-[#5D4037] bg-transparent mb-4 outline-none placeholder-amber-900/30 text-[#2C1810] font-bold" placeholder="Title..." value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddItem()} />
                                <div className="flex gap-2 w-full mb-4">
                                    {['HEALTH', 'STUDY', 'SOCIAL', 'GOLD'].map(t => (
                                        <button key={t} onClick={() => setNewItemType(t as any)} className={`flex-1 py-1 text-xs font-bold rounded-sm border ${newItemType === t ? 'bg-[#2C1810] text-[#D4AF37] border-[#D4AF37]' : 'bg-transparent text-[#5D4037] border-[#D7C4A1]'}`}>{t}</button>
                                    ))}
                                </div>
                                <div className="flex gap-2 w-full">
                                    <button onClick={() => setShowAddModal(null)} className="flex-1 py-2 text-[#5D4037] font-bold hover:bg-black/5 rounded-sm">Cancel</button>
                                    <button onClick={handleAddItem} className="flex-1 py-2 bg-[#D4AF37] text-[#2C1810] border border-[#B08D55] font-bold rounded-sm hover:bg-[#EAC159]">Add</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* RIGHT: Incubator OR Dragon Management */}
            <div className="flex-1 glass-panel flex flex-col items-center justify-center relative overflow-hidden p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(44,24,16,0.05)_100%)]" />

                {activeEgg ? (
                    <div className="flex flex-col items-center relative z-10">
                        <DynamicEgg egg={activeEgg} />
                        <h2 className="text-3xl font-medieval mt-8 text-[#2C1810] tracking-widest">{activeEgg.rarity} EGG</h2>
                        <div className="mt-4 w-64 h-4 bg-[#2C1810]/10 rounded-full overflow-hidden border border-[#2C1810]/20">
                            <motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-500" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (activeEgg.heat / activeEgg.requiredHeat) * 100)}%` }} />
                        </div>
                        <div className="text-xs text-[#5D4037] mt-2 font-mono font-bold">HEAT: {activeEgg.heat} / {activeEgg.requiredHeat}</div>
                        {activeEgg.isReadyToHatch && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => { playSound('HATCH'); hatchEgg("New Dragon", ""); }} className="mt-8 px-8 py-3 bg-[#D4AF37] text-[#2C1810] font-bold font-medieval text-xl rounded shadow-lg border border-[#B08D55] animate-pulse">HATCH DRAGON</motion.button>
                        )}
                        <div className="mt-8 grid grid-cols-4 gap-2 opacity-60">
                            {Object.entries(activeEgg.history).slice(0, 4).map(([key, val]) => (
                                <div key={key} className="text-center">
                                    <div className="text-[10px] uppercase text-[#5D4037]">{key}</div>
                                    <div className="text-xs font-bold text-[#2C1810]">{val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeDragon && (
                    // --- DRAGON MANAGEMENT UI ---
                    <div className="flex flex-col w-full h-full relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-4xl font-medieval text-[#2C1810]">{activeDragon.name}</h2>
                                <span className="text-sm font-bold text-[#8B4513] uppercase tracking-widest">L{activeDragon.level} {activeDragon.stage} {activeDragon.type} DRAGON</span>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-[#2C1810]">{Math.floor(activeDragon.xp)} <span className="text-sm text-[#5D4037] font-normal">/ {activeDragon.level * 100} XP</span></div>
                            </div>
                        </div>

                        {/* Main View Area */}
                        <div className="flex-1 flex gap-8">

                            {/* Visuals (Left) */}
                            <div className="flex-1 flex flex-col items-center justify-center bg-white/30 rounded-lg border border-[#D7C4A1] relative">
                                <motion.div
                                    className="filter drop-shadow-xl"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, type: "tween" }}
                                >
                                    <PixelDragon dna={activeDragon.dna} size={12} />
                                </motion.div>

                                {/* Evolution Button */}
                                {activeDragon.xp >= activeDragon.level * 100 && (
                                    <motion.button
                                        onClick={() => { evolveDragon(activeDragon.id); playSound('LEVEL_UP'); }}
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="absolute bottom-6 px-6 py-2 bg-purple-700 text-white font-bold rounded-full shadow-lg border border-purple-400 flex items-center gap-2"
                                    >
                                        <ArrowUpCircle /> EVOLVE NOW
                                    </motion.button>
                                )}
                            </div>

                            {/* Controls (Right) */}
                            <div className="w-1/3 flex flex-col gap-4">

                                {/* Stats Panel */}
                                <div className="bg-[#FDF6E3] p-4 rounded-sm border border-[#D7C4A1] space-y-3">
                                    <h3 className="font-medieval text-[#2C1810] border-b border-[#D7C4A1] pb-1">Attributes</h3>

                                    <div className="flex justify-between items-center group">
                                        <div className="flex items-center gap-2 text-[#5D4037]"><Sword size={14} /> STR</div>
                                        <div className="font-bold text-[#2C1810]">{activeDragon.stats.strength}</div>
                                        <button onClick={() => { trainDragon(activeDragon.id, 'STRENGTH'); playSound('CLICK'); }} className="opacity-0 group-hover:opacity-100 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Train (-20 En)</button>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <div className="flex items-center gap-2 text-[#5D4037]"><Book size={14} /> WIS</div>
                                        <div className="font-bold text-[#2C1810]">{activeDragon.stats.wisdom}</div>
                                        <button onClick={() => { trainDragon(activeDragon.id, 'WISDOM'); playSound('CLICK'); }} className="opacity-0 group-hover:opacity-100 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Train (-20 En)</button>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <div className="flex items-center gap-2 text-[#5D4037]"><Music size={14} /> CHA</div>
                                        <div className="font-bold text-[#2C1810]">{activeDragon.stats.charisma}</div>
                                        <button onClick={() => { trainDragon(activeDragon.id, 'CHARISMA'); playSound('CLICK'); }} className="opacity-0 group-hover:opacity-100 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Train (-20 En)</button>
                                    </div>
                                </div>

                                {/* Care Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { feedDragon(activeDragon.id, 10); playSound('EATING'); }}
                                        className="flex-1 py-3 bg-green-100 text-green-800 border border-green-300 rounded font-bold hover:bg-green-200 transition flex flex-col items-center gap-1"
                                    >
                                        <Heart size={20} className="fill-current" />
                                        Feed (-10)
                                    </button>
                                </div>

                                {/* Lore Snippet */}
                                <div className="bg-black/5 p-3 rounded text-xs text-[#5D4037] italic font-serif">
                                    "{activeDragon.lore}"
                                </div>
                            </div>
                        </div>

                        {/* Dragon Selector (if multiple) */}
                        {dragons.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                {dragons.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => setSelectedDragonId(d.id)}
                                        className={`px-4 py-2 rounded border font-bold text-sm whitespace-nowrap ${selectedDragonId === d.id ? 'bg-[#2C1810] text-[#D4AF37]' : 'bg-[#FDF6E3] text-[#5D4037]'}`}
                                    >
                                        {d.name}
                                    </button>
                                ))}
                                <button onClick={() => startNewEgg('COMMON')} className="px-4 py-2 bg-slate-200 text-slate-500 rounded font-bold text-sm">+ New Egg</button>
                            </div>
                        )}
                        {dragons.length === 1 && !activeEgg && (
                            <button onClick={() => startNewEgg('COMMON')} className="mt-4 w-full py-2 bg-slate-200 text-slate-500 rounded font-bold text-sm border-2 border-dashed border-slate-300 hover:bg-slate-300">+ Incubate New Egg</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const FocusButton: React.FC<{ active: boolean, onClick: () => void, icon: any, label: string, color: string }> = ({ active, onClick, icon: Icon, label, color }) => (
    <button
        onClick={onClick}
        className={`p-4 rounded-sm border-2 flex flex-col items-center gap-2 transition-all ${active ? 'bg-[#FDF6E3] border-[#D4AF37] shadow-lg scale-105' : 'bg-[#FDF6E3]/40 border-transparent hover:bg-[#FDF6E3]/80'}`}
    >
        <Icon className={active ? color : 'text-[#8D6E63]'} size={24} />
        <span className={`text-xs font-bold uppercase ${active ? 'text-[#2C1810]' : 'text-[#8D6E63]'}`}>{label}</span>
    </button>
);

export default Hatchery;
