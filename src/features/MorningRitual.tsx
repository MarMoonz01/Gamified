import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragonStore } from '../logic/dragonStore';
import type { Task } from '../logic/dragonStore';
import { geminiService } from '../logic/GeminiService';
import { Sun, Coffee, Zap, Battery, BatteryCharging, Sparkles, Brain, Dumbbell, Palette } from 'lucide-react';

interface MorningRitualProps {
    onClose: () => void;
}

type Mood = 'TIRED' | 'NEUTRAL' | 'ENERGETIC';
type Focus = 'STUDY' | 'HEALTH' | 'CREATION';
type Time = '15_MINS' | '1_HOUR' | 'ALL_DAY';

const MorningRitual: React.FC<MorningRitualProps> = ({ onClose }) => {
    const { habits, setTasks, addHeat } = useDragonStore();
    const [step, setStep] = useState<'MOOD' | 'FOCUS' | 'TIME' | 'GENERATING' | 'RESULT'>('MOOD');

    const [mood, setMood] = useState<Mood>('NEUTRAL');
    const [focus, setFocus] = useState<Focus>('STUDY');
    const [time, setTime] = useState<Time>('1_HOUR');

    const [aiResponse, setAiResponse] = useState<{ quote: string, heroTask: Task } | null>(null);

    const generateSchedule = async () => {
        setStep('GENERATING');

        const prompt = `
            You are Elder Ignis, a wise dragon mentor.
            The user is feeling ${mood}.
            They want to focus on ${focus}.
            They have ${time.replace('_', ' ').toLowerCase()} available.
            
            Here are their existing habits:
            ${JSON.stringify(habits.map(h => ({ id: h.id, title: h.title, type: h.type })))}

            Your goal:
            1. Select up to 3 habits from the list that fit their mood and time.
            2. Create 1 unique "Hero Task" (Type: GOLD) that is a specific, actionable step towards their ${focus} goal.
            3. Provide a short, wise, dragon-themed motivational quote suited to their mood.

            Return JSON format only:
            {
                "selectedHabitIds": ["id1", "id2"],
                "heroTask": { "title": "Task Title", "type": "GOLD" },
                "quote": "Your quote here."
            }
        `;

        const result = await geminiService.generateJSON<{ selectedHabitIds: string[], heroTask: any, quote: string }>(prompt);

        if (result) {
            // Logic to replace tasks
            const newTasks: Task[] = [];

            // Add selected habits as tasks (for the day)
            // Actually, we should probably keep habits as habits, and just add specific tasks? 
            // The prompt asks to select habits. Let's add them as tasks to "Done" list? 
            // Or just add the Hero Task and maybe some "Habit Check" tasks?
            // Let's just add the Hero Task and maybe 2-3 other suggested tasks based on habits?
            // Wait, the user wants a "Schedule".

            // Let's filter habits to show them as "Recommended" in the UI, but strictly add the Hero Task to the Task list.
            // Actually, let's play into the "Agent" role. It *sets* your tasks.

            // 1. Hero Task
            newTasks.push({
                id: 'hero-task-' + Date.now(),
                title: `(Hero) ${result.heroTask.title}`,
                completed: false,
                type: 'GOLD',
                rank: 'S' // Hero tasks are S rank
            });

            // 2. Add "Ritual" tasks for selected habits?
            result.selectedHabitIds.forEach(id => {
                const habit = habits.find(h => h.id === id);
                if (habit) {
                    newTasks.push({
                        id: `daily-${habit.id}-${Date.now()}`,
                        title: habit.title,
                        completed: false,
                        type: habit.type === 'BOTH' ? 'GOLD' : habit.type,
                        rank: 'D' // Daily habits are D rank
                    });
                }
            });

            setTasks(newTasks);
            setAiResponse({ quote: result.quote, heroTask: newTasks[0] });
            setStep('RESULT');
            addHeat(50, 'SOCIAL'); // Bonus for talking to Ignis
        } else {
            // Fallback
            setStep('MOOD'); // Reset on error
            alert("Elder Ignis is meditating... try again (Check API Key).");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-[#FDF6E3] w-full max-w-lg rounded-xl shadow-2xl border-2 border-[#8B4513] overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-[#2C1810] p-4 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 border-2 border-[#D4AF37] flex items-center justify-center">
                            <Sun className="text-[#2C1810]" />
                        </div>
                        <div>
                            <h2 className="font-medieval text-xl text-[#D4AF37]">Morning Ritual</h2>
                            <p className="text-xs text-amber-300/60 uppercase tracking-widest">Consult Elder Ignis</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#D7C4A1] hover:text-white">✕</button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {step === 'MOOD' && (
                            <motion.div key="mood" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                <h3 className="text-2xl font-medieval text-[#2C1810] text-center">How does your spirit feel today?</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <button onClick={() => { setMood('TIRED'); setStep('FOCUS'); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-amber-50 hover:border-amber-500 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-slate-200 rounded-full group-hover:bg-amber-200"><Battery size={24} className="text-slate-600 group-hover:text-amber-800" /></div>
                                        <span className="font-bold text-[#5D4037] group-hover:text-[#2C1810]">Exhausted / Low Energy</span>
                                    </button>
                                    <button onClick={() => { setMood('NEUTRAL'); setStep('FOCUS'); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-amber-50 hover:border-amber-500 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-blue-100 rounded-full group-hover:bg-amber-200"><BatteryCharging size={24} className="text-blue-600 group-hover:text-amber-800" /></div>
                                        <span className="font-bold text-[#5D4037] group-hover:text-[#2C1810]">Balanced / Neutral</span>
                                    </button>
                                    <button onClick={() => { setMood('ENERGETIC'); setStep('FOCUS'); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-amber-50 hover:border-amber-500 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-amber-100 rounded-full group-hover:bg-amber-200"><Zap size={24} className="text-amber-600 group-hover:text-amber-800" /></div>
                                        <span className="font-bold text-[#5D4037] group-hover:text-[#2C1810]">Energetic / Ready to Burn</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'FOCUS' && (
                            <motion.div key="focus" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                <h3 className="text-2xl font-medieval text-[#2C1810] text-center">Where shall we direct your flame?</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <button onClick={() => { setFocus('STUDY'); setStep('TIME'); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-blue-50 hover:border-blue-500 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200"><Brain size={24} className="text-blue-600" /></div>
                                        <span className="font-bold text-[#5D4037] group-hover:text-blue-900">Wisdom (Study / IELTS)</span>
                                    </button>
                                    <button onClick={() => { setFocus('HEALTH'); setStep('TIME'); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-red-50 hover:border-red-500 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200"><Dumbbell size={24} className="text-red-600" /></div>
                                        <span className="font-bold text-[#5D4037] group-hover:text-red-900">Vitality (Health / Fitness)</span>
                                    </button>
                                    <button onClick={() => { setFocus('CREATION'); setStep('TIME'); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-purple-50 hover:border-purple-500 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200"><Palette size={24} className="text-purple-600" /></div>
                                        <span className="font-bold text-[#5D4037] group-hover:text-purple-900">Radiance (Creativity / Social)</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'TIME' && (
                            <motion.div key="time" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                <h3 className="text-2xl font-medieval text-[#2C1810] text-center">How much time can you commit?</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <button onClick={() => { setTime('15_MINS'); generateSchedule(); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-green-50 hover:border-green-500 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200"><Coffee size={24} className="text-green-600" /></div>
                                        <div className="text-left">
                                            <div className="font-bold text-[#5D4037] group-hover:text-[#2C1810]">15 Minutes</div>
                                            <div className="text-xs text-[#8B4513]">Quick session to keep the fire alive.</div>
                                        </div>
                                    </button>
                                    <button onClick={() => { setTime('1_HOUR'); generateSchedule(); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-green-50 hover:border-green-500 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200"><Sparkles size={24} className="text-green-600" /></div>
                                        <div className="text-left">
                                            <div className="font-bold text-[#5D4037] group-hover:text-[#2C1810]">1 Hour</div>
                                            <div className="text-xs text-[#8B4513]">Solid progress block.</div>
                                        </div>
                                    </button>
                                    <button onClick={() => { setTime('ALL_DAY'); generateSchedule(); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-green-50 hover:border-green-500 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200"><Sun size={24} className="text-green-600" /></div>
                                        <div className="text-left">
                                            <div className="font-bold text-[#5D4037] group-hover:text-[#2C1810]">All Day</div>
                                            <div className="text-xs text-[#8B4513]">Ready to conquer the world.</div>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'GENERATING' && (
                            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                                    <Sparkles size={48} className="text-[#D4AF37]" />
                                </motion.div>
                                <h3 className="text-xl font-medieval text-[#2C1810]">Elder Ignis is consulting the stars...</h3>
                                <p className="text-sm text-[#8B4513]">Curating your destiny.</p>
                            </motion.div>
                        )}

                        {step === 'RESULT' && aiResponse && (
                            <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                                <div className="bg-[#2C1810]/5 p-6 rounded-lg border border-[#D7C4A1] italic text-center font-serif text-[#5D4037]">
                                    "{aiResponse.quote}"
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-[#8B4513] text-center mb-4">Your Hero Task</h4>
                                    <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37] rounded-lg flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#2C1810] font-bold">!</div>
                                        <div className="font-bold text-[#2C1810] text-lg">{aiResponse.heroTask.title}</div>
                                    </div>
                                </div>

                                <div className="text-center text-sm text-[#8B4513] mt-4">
                                    I have updated your Daily Tasks board. Go forth and conquer!
                                </div>

                                <button onClick={onClose} className="w-full py-4 bg-[#2C1810] text-[#D4AF37] font-medieval text-xl rounded-lg hover:bg-black transition shadow-lg mt-4">
                                    Accept Destiny
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MorningRitual;
