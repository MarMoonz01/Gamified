import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragonStore } from '../logic/dragonStore';
import type { Task } from '../logic/dragonStore';
import { geminiService } from '../logic/GeminiService';
import { Sun, Shield, Flame, Battery, BatteryCharging, Zap, Brain, Dumbbell, Palette, CheckCircle } from 'lucide-react';

interface MorningRitualProps {
    onClose: () => void;
}

type Mood = 'TIRED' | 'NEUTRAL' | 'ENERGETIC';
type Focus = 'STUDY' | 'HEALTH' | 'CREATION';
type Intensity = 'LOW' | 'MEDIUM' | 'HIGH';

interface TimelineItem {
    time: string;
    activity: string;
    type: 'GOLD' | 'FOOD' | 'REST' | 'WORK' | 'STUDY';
    description: string;
}

const DragonStrategist: React.FC<MorningRitualProps> = ({ onClose }) => {
    const { habits, setTasks, addHeat } = useDragonStore();
    const [step, setStep] = useState<'MOOD' | 'FOCUS' | 'INTENSITY' | 'GENERATING' | 'TIMELINE'>('MOOD');

    const [mood, setMood] = useState<Mood>('NEUTRAL');
    const [focus, setFocus] = useState<Focus>('STUDY');
    const [intensity, setIntensity] = useState<Intensity>('MEDIUM');

    const [aiResponse, setAiResponse] = useState<{ quote: string, timeline: TimelineItem[] } | null>(null);

    const generateSchedule = async () => {
        setStep('GENERATING');

        const prompt = `
            You are Elder Ignis, a wise dragon strategist.
            The user is feeling ${mood}.
            They want to focus on ${focus}.
            They want a ${intensity} intensity schedule.
            
            Current Habits: ${JSON.stringify(habits.map(h => h.title))}

            Goal: Create a Full Day Timeline (08:00 - 22:00) that balances their focus with their mood.
            
            Instructions:
            1. Create a timeline of activity blocks.
            2. Include specifically:
               - "Dragon Breakfast" & "Dragon Dinner" (Suggest specific meals based on ${focus} goal).
               - "Deep Work" / "Study" blocks depending on focus.
               - "Rest" / "Recovery" blocks if mood is TIRED.
            3. Each item needs a time (HH:MM), title, type (GOLD, FOOD, REST, WORK, STUDY), and short description.
            4. Provide a wise quote at the end.

            Return JSON ONLY:
            {
                "timeline": [
                    { "time": "08:00", "activity": "Dragon Breakfast: Oatmeal & Berries", "type": "FOOD", "description": "Fuel for the mind." },
                    { "time": "09:00", "activity": "Deep Study: IELTS Reading", "type": "STUDY", "description": "Focus on comprehension." }
                ],
                "quote": "Fire burns brightest when controlled."
            }
        `;

        const result = await geminiService.generateJSON<{ timeline: TimelineItem[], quote: string }>(prompt);

        if (result && result.timeline) {
            setAiResponse(result);
            setStep('TIMELINE');
            addHeat(20, 'SOCIAL');
        } else {
            setStep('MOOD');
            alert("Elder Ignis is meditating... try again.");
        }
    };

    const handleAccept = () => {
        if (!aiResponse) return;

        const newTasks: Task[] = aiResponse.timeline.map((item, index) => ({
            id: `strat-${Date.now()}-${index}`,
            title: `[${item.time}] ${item.activity}`,
            completed: false,
            // Map types to game types
            type: item.type === 'REST' || item.type === 'FOOD' ? 'HEALTH' : 'GOLD',
            rank: item.type === 'STUDY' || item.type === 'WORK' ? 'A' : 'D',
            goldValue: item.type === 'STUDY' ? 50 : 10,
            xpValue: item.type === 'STUDY' ? 100 : 20
        }));

        // Add to existing tasks or replace? Let's add to top.
        // Actually, user might want to clear old dailies? 
        // For now, let's just prepend.
        setTasks((prev) => [...newTasks, ...prev]);

        addHeat(100, 'SOCIAL'); // Big bonus for accepting strategy
        onClose();
        alert("Strategy Adopted! Your tasks have been updated.");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-[#1a120b] w-full max-w-2xl rounded-xl shadow-2xl border-2 border-[#D4AF37] overflow-hidden flex flex-col max-h-[90vh] relative"
            >
                {/* Header */}
                <div className="bg-[#2C1810] p-6 flex justify-between items-center border-b border-[#D4AF37]/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 border-2 border-[#D4AF37] flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Brain className="text-[#2C1810]" size={24} />
                        </div>
                        <div>
                            <h2 className="font-medieval text-2xl text-[#D4AF37] tracking-wide">Dragon Strategist</h2>
                            <p className="text-xs text-amber-300/60 uppercase tracking-widest">Daily War Room</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#D7C4A1] hover:text-white transition-colors">✕</button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 'MOOD' && (
                            <motion.div key="mood" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                                <h3 className="text-3xl font-medieval text-[#E8D4B0] text-center">State of Mind</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'TIRED', label: 'Exhausted', icon: Battery, color: 'text-slate-400', bg: 'bg-slate-900/50', border: 'border-slate-700' },
                                        { id: 'NEUTRAL', label: 'Balanced', icon: BatteryCharging, color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-700' },
                                        { id: 'ENERGETIC', label: 'Ready for War', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-700' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setMood(item.id as Mood); setStep('FOCUS'); }}
                                            className={`p-6 border ${item.border} rounded-lg ${item.bg} hover:brightness-125 flex items-center gap-6 transition-all group`}
                                        >
                                            <item.icon size={32} className={`${item.color}`} />
                                            <span className="font-bold text-xl text-[#E8D4B0]">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 'FOCUS' && (
                            <motion.div key="focus" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                                <h3 className="text-3xl font-medieval text-[#E8D4B0] text-center">Primary Objective</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'STUDY', label: 'Wisdom (IELTS/Study)', icon: Brain, color: 'text-blue-400', desc: 'Focus on mental expansion.' },
                                        { id: 'HEALTH', label: 'Vitality (Health)', icon: Dumbbell, color: 'text-red-400', desc: 'Strengthen the vessel.' },
                                        { id: 'CREATION', label: 'Creation (Work/Art)', icon: Palette, color: 'text-purple-400', desc: 'Manifest your vision.' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setFocus(item.id as Focus); setStep('INTENSITY'); }}
                                            className="p-6 border border-[#D7C4A1]/30 rounded-lg bg-[#2C1810]/40 hover:bg-[#2C1810]/70 flex items-center gap-6 transition-all group text-left"
                                        >
                                            <div className={`p-4 rounded-full bg-black/30 ${item.color}`}>
                                                <item.icon size={32} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-xl text-[#E8D4B0]">{item.label}</div>
                                                <div className="text-sm text-[#8B4513]">{item.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 'INTENSITY' && (
                            <motion.div key="intensity" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                                <h3 className="text-3xl font-medieval text-[#E8D4B0] text-center">Engagement Level</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'LOW', label: 'Tactical Retreat', icon: Shield, color: 'text-green-400', desc: 'Light load, prioritize recovery.' },
                                        { id: 'MEDIUM', label: 'Standard Maneuvers', icon: Flame, color: 'text-orange-400', desc: 'Balanced progress.' },
                                        { id: 'HIGH', label: 'All-Out Assault', icon: Sun, color: 'text-red-500', desc: 'Maximum effort, no excuses.' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setIntensity(item.id as Intensity); generateSchedule(); }}
                                            className="p-6 border border-[#D7C4A1]/30 rounded-lg bg-[#2C1810]/40 hover:bg-[#2C1810]/70 flex items-center gap-6 transition-all group text-left"
                                        >
                                            <item.icon size={32} className={`${item.color}`} />
                                            <div>
                                                <div className="font-bold text-xl text-[#E8D4B0]">{item.label}</div>
                                                <div className="text-sm text-[#8B4513]">{item.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 'GENERATING' && (
                            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-center space-y-6">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                                    <div className="w-20 h-20 rounded-full border-4 border-t-[#D4AF37] border-r-[#D4AF37]/50 border-b-[#D4AF37]/20 border-l-transparent"></div>
                                </motion.div>
                                <div>
                                    <h3 className="text-2xl font-medieval text-[#D4AF37]">Consulting the War Council...</h3>
                                    <p className="text-[#8B4513] mt-2">Forging your daily destiny.</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'TIMELINE' && aiResponse && (
                            <motion.div key="timeline" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                                <div className="bg-[#2C1810]/20 p-4 rounded-lg border border-[#D4AF37]/30 italic text-center font-serif text-[#E8D4B0] text-lg">
                                    "{aiResponse.quote}"
                                </div>

                                <div className="space-y-3 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-[#D4AF37]/20">
                                    {aiResponse.timeline.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="relative pl-10"
                                        >
                                            <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]"></div>
                                            <div className="bg-[#1a120b] border border-[#D7C4A1]/20 p-4 rounded hover:border-[#D4AF37]/60 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-mono text-[#D4AF37] font-bold">{item.time}</span>
                                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${item.type === 'GOLD' ? 'border-amber-500 text-amber-500' :
                                                        item.type === 'FOOD' ? 'border-green-500 text-green-500' :
                                                            item.type === 'REST' ? 'border-blue-500 text-blue-500' :
                                                                'border-purple-500 text-purple-500'
                                                        }`}>{item.type}</span>
                                                </div>
                                                <div className="font-bold text-[#E8D4B0] text-lg">{item.activity}</div>
                                                <p className="text-sm text-[#8B4513]">{item.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        onClick={() => setStep('MOOD')}
                                        className="flex-1 py-3 border border-[#D7C4A1]/30 text-[#8B4513] rounded hover:bg-[#2C1810]/20 font-medieval font-bold"
                                    >
                                        Restart
                                    </button>
                                    <button
                                        onClick={handleAccept}
                                        className="flex-[2] py-3 bg-[#D4AF37] text-[#2C1810] rounded shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] transition-all font-medieval font-bold text-xl flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={20} /> Accept Battle Plan
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DragonStrategist;
