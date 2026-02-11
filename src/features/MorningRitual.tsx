import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragonStore } from '../logic/dragonStore';
import type { Task } from '../logic/dragonStore';
import { geminiService } from '../logic/GeminiService';
import {
    Sun, Battery, BatteryCharging, Zap, Sparkles,
    Dumbbell, Utensils, Clock, Coffee
} from 'lucide-react';

interface MorningRitualProps {
    onClose: () => void;
}

type Mood = 'TIRED' | 'NEUTRAL' | 'ENERGETIC';

// โครงสร้างข้อมูลสำหรับตารางเวลาจาก AI
interface ScheduleItem {
    time: string;
    activity: string;
    type: 'MEAL' | 'WORK' | 'REST' | 'ROUTINE' | 'EXERCISE';
    details?: string;
}

const MorningRitual: React.FC<MorningRitualProps> = ({ onClose }) => {
    // ดึง tasks เดิมมาด้วย เพื่อเอามาต่อท้าย (Append) ไม่ให้ของเก่าหาย
    const { addHabit, addTask } = useDragonStore();

    const [step, setStep] = useState<'MOOD' | 'GENERATING' | 'RESULT'>('MOOD');

    // Create Ref or just local const in render if needed, but for now we just pass it to generate
    // removing state mood if not used for persistence

    const [aiResponse, setAiResponse] = useState<{ quote: string, schedule: ScheduleItem[] } | null>(null);

    const generateSchedule = async (selectedMood: Mood) => {
        setStep('GENERATING');

        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        const prompt = `
            You are Elder Ignis, a wise dragon strategist acting as a personal secretary.
            The current time is ${currentTime}.
            The user is feeling ${selectedMood}.
            
            Design a "Daily Battle Plan" (Itinerary) for the REST of the day (until sleep).
            
            CRITICAL INSTRUCTIONS:
            1. Start the schedule from ${currentTime}.
            2. CREATE A BALANCED MIX of:
               - IELTS Study (Reading/Listening/Writing/Speaking - be specific, e.g., "IELTS Reading Passage 1")
               - Physical Health (Exercise/Stretching/Walk - adapted to feeling ${selectedMood})
               - Meals & Rest
            3. If user is TIRED, focus on recovery and light study. 
            4. If ENERGETIC, push for high-intensity study and workout.
            
            Return JSON only:
            {
                "schedule": [
                    { "time": "14:00", "activity": "IELTS Reading: Passage 1", "type": "WORK", "details": "Focus on T/F/NG questions" },
                    { "time": "15:30", "activity": "Light Stretching", "type": "EXERCISE", "details": "Relieve back tension" },
                    { "time": "18:00", "activity": "Dragon Feast (Dinner)", "type": "MEAL" }
                ],
                "quote": "A fiery motivational quote tailored to the mood."
            }
        `;

        try {
            const result = await geminiService.generateJSON<{ schedule: ScheduleItem[], quote: string }>(prompt);
            if (result) {
                setAiResponse(result);
                setStep('RESULT');
            } else {
                setStep('MOOD');
                alert("Elder Ignis is silent... (Check API Key)");
            }
        } catch (error) {
            console.error(error);
            setStep('MOOD');
        }
    };

    const acceptSchedule = () => {
        if (!aiResponse) return;

        aiResponse.schedule.forEach(item => {
            // Parse Time for Expiration (Window: 2 Hours)
            const [hours, minutes] = item.time.split(':').map(Number);
            const scheduleDate = new Date();
            scheduleDate.setHours(hours, minutes, 0, 0);

            // Expiration = Schedule Time + 2 Hours
            const expiresAt = scheduleDate.getTime() + (2 * 60 * 60 * 1000);

            // Logic: Meals/Exercise/Rest -> Habits
            if (['MEAL', 'REST', 'EXERCISE'].includes(item.type)) {
                let habitType: 'HEALTH' | 'STUDY' | 'SOCIAL' | 'GOLD' = 'HEALTH';
                if (item.type === 'EXERCISE') habitType = 'HEALTH';

                addHabit(`[${item.time}] ${item.activity}`, habitType, expiresAt);
            } else {
                // WORK / ROUTINE -> Task
                let taskType: Task['type'] = 'STUDY';
                let rank: any = 'C';

                if (item.type === 'ROUTINE') {
                    taskType = 'GOLD';
                    rank = 'D';
                } else if (item.type === 'WORK') {
                    taskType = 'STUDY';
                    rank = 'A';
                }

                addTask(
                    `[${item.time}] ${item.activity}`,
                    taskType,
                    rank,
                    item.details || "Elder Ignis Plan",
                    expiresAt
                );
            }
        });

        onClose();
    };

    // Helper เลือกไอคอน
    const getIcon = (type: string) => {
        switch (type) {
            case 'MEAL': return <Utensils size={16} className="text-orange-500" />;
            case 'WORK': return <Sparkles size={16} className="text-amber-500" />;
            case 'REST': return <Coffee size={16} className="text-blue-500" />;
            case 'EXERCISE': return <Dumbbell size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-slate-500" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-[#FDF6E3] w-full max-w-lg rounded-xl shadow-2xl border-2 border-[#8B4513] overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="bg-[#2C1810] p-4 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 border-2 border-[#D4AF37] flex items-center justify-center">
                            <Sun className="text-[#2C1810]" />
                        </div>
                        <div>
                            <h2 className="font-medieval text-xl text-[#D4AF37]">Daily Strategist</h2>
                            <p className="text-xs text-amber-300/60 uppercase tracking-widest">Elder Ignis Planning</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#D7C4A1] hover:text-white">✕</button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 'MOOD' && (
                            <motion.div key="mood" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                <h3 className="text-2xl font-medieval text-[#2C1810] text-center">Current Status?</h3>
                                <p className="text-center text-[#5D4037] text-sm italic">
                                    "Tell me your state, and I shall craft a plan for the rest of this day."
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    <button onClick={() => generateSchedule('TIRED')} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-amber-50 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-slate-200 rounded-full"><Battery size={24} className="text-slate-600" /></div>
                                        <div className="text-left">
                                            <span className="font-bold text-[#5D4037] block">Low Battery</span>
                                            <span className="text-xs text-[#8D6E63]">Focus on recovery & light tasks</span>
                                        </div>
                                    </button>
                                    <button onClick={() => generateSchedule('NEUTRAL')} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-amber-50 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-blue-100 rounded-full"><BatteryCharging size={24} className="text-blue-600" /></div>
                                        <div className="text-left">
                                            <span className="font-bold text-[#5D4037] block">Balanced</span>
                                            <span className="text-xs text-[#8D6E63]">Standard progression speed</span>
                                        </div>
                                    </button>
                                    <button onClick={() => generateSchedule('ENERGETIC')} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-amber-50 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-amber-100 rounded-full"><Zap size={24} className="text-amber-600" /></div>
                                        <div className="text-left">
                                            <span className="font-bold text-[#5D4037] block">Overcharged</span>
                                            <span className="text-xs text-[#8D6E63]">Maximum intensity & gains</span>
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
                                <h3 className="text-xl font-medieval text-[#2C1810]">Elder Ignis is strategizing...</h3>
                            </motion.div>
                        )}

                        {step === 'RESULT' && aiResponse && (
                            <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 pb-4">
                                <div className="bg-[#2C1810]/5 p-4 rounded-lg border border-[#D7C4A1] italic text-center font-serif text-[#5D4037] text-sm">
                                    "{aiResponse.quote}"
                                </div>

                                <div className="space-y-4">
                                    <div className="relative border-l-2 border-[#D4AF37] ml-4 space-y-6 py-2">
                                        {aiResponse.schedule.map((item, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#FDF6E3] border-2 border-[#D4AF37] flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-[#2C1810]"></div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-[#D4AF37] bg-[#2C1810] px-2 py-0.5 rounded w-fit mb-1 shadow-sm">
                                                        {item.time}
                                                    </span>
                                                    <div className="flex items-start gap-2">
                                                        <div className="mt-1">{getIcon(item.type)}</div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[#5D4037]">{item.activity}</span>
                                                            {item.details && (
                                                                <span className="text-xs text-[#8D6E63] italic">{item.details}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 sticky bottom-0 bg-[#FDF6E3] pb-2 border-t border-[#D7C4A1]/50">
                                    <button onClick={() => setStep('MOOD')} className="flex-1 py-3 border-2 border-[#2C1810] text-[#2C1810] font-medieval rounded-lg hover:bg-amber-50 transition text-sm">
                                        Recalculate
                                    </button>
                                    <button onClick={acceptSchedule} className="flex-[2] py-3 bg-[#2C1810] text-[#D4AF37] font-medieval rounded-lg hover:bg-black transition shadow-lg flex items-center justify-center gap-2 text-sm">
                                        <Sparkles size={18} />
                                        Accept Plan
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

export default MorningRitual;
