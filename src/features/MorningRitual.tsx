import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragonStore } from '../logic/dragonStore';
import type { Task } from '../logic/dragonStore';
import { geminiService } from '../logic/GeminiService';
import {
    Sun, Battery, BatteryCharging, Zap, Sparkles,
    Brain, Dumbbell, Palette, Utensils, Clock, Coffee
} from 'lucide-react';

interface MorningRitualProps {
    onClose: () => void;
}

type Mood = 'TIRED' | 'NEUTRAL' | 'ENERGETIC';
type Focus = 'STUDY' | 'HEALTH' | 'CREATION';

// โครงสร้างข้อมูลสำหรับตารางเวลาจาก AI
interface ScheduleItem {
    time: string;
    activity: string;
    type: 'MEAL' | 'WORK' | 'REST' | 'ROUTINE';
}

const MorningRitual: React.FC<MorningRitualProps> = ({ onClose }) => {
    // ดึง tasks เดิมมาด้วย เพื่อเอามาต่อท้าย (Append) ไม่ให้ของเก่าหาย
    const { tasks, setTasks, addHeat } = useDragonStore();

    const [step, setStep] = useState<'MOOD' | 'FOCUS' | 'GENERATING' | 'RESULT'>('MOOD');
    const [mood, setMood] = useState<Mood>('NEUTRAL');
    const [focus, setFocus] = useState<Focus>('STUDY');

    const [aiResponse, setAiResponse] = useState<{ quote: string, schedule: ScheduleItem[] } | null>(null);

    const generateSchedule = async (selectedFocus: Focus) => {
        setStep('GENERATING');
        setFocus(selectedFocus);

        const prompt = `
            You are Elder Ignis, a wise dragon strategist acting as a personal secretary.
            The user is feeling ${mood}.
            Their main goal for today is ${selectedFocus}.
            
            Design a "Daily Battle Plan" (Itinerary).
            Include:
            1. Wake Up time / Start time.
            2. Meal suggestions (Breakfast/Lunch/Dinner) fitting the goal.
            3. Deep Work/Study blocks.
            4. Rest/Recovery blocks.
            5. Bedtime.

            Return JSON only:
            {
                "schedule": [
                    { "time": "08:00", "activity": "Dragon Breakfast", "type": "MEAL" },
                    { "time": "09:00", "activity": "Deep Work: Coding", "type": "WORK" },
                    { "time": "23:00", "activity": "Sleep", "type": "REST" }
                ],
                "quote": "A fiery motivational quote."
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

        // แปลง Schedule เป็น Task ที่ถูกต้องตาม Type ใน DragonStore
        const newTasks: Task[] = aiResponse.schedule.map((item, index) => {
            let type: Task['type'] = 'GOLD'; // Default
            let rank: Task['rank'] = 'D';

            // Mapping Logic ให้ตรงกับ Store Type ('HEALTH' | 'STUDY' | 'SOCIAL' | 'GOLD')
            switch (item.type) {
                case 'MEAL':
                case 'REST':
                    type = 'HEALTH';
                    rank = 'E';
                    break;
                case 'WORK':
                    // ถ้า Focus เป็น STUDY ให้ type เป็น STUDY, ถ้าไม่ใช่ให้เป็น GOLD
                    type = focus === 'STUDY' ? 'STUDY' : 'GOLD';
                    rank = 'S';
                    break;
                case 'ROUTINE':
                    type = 'GOLD';
                    rank = 'D';
                    break;
            }

            return {
                id: `sched-${Date.now()}-${index}`,
                title: `[${item.time}] ${item.activity}`,
                completed: false,
                type: type,
                rank: rank,
                description: "Elder Ignis Plan"
            };
        });

        // Append ต่อจาก Task เดิม (หรือจะใช้ newTasks เลยถ้าอยากล้างของเก่า ให้แก้เป็น setTasks(newTasks))
        setTasks([...tasks, ...newTasks]);

        addHeat(100, 'SOCIAL'); // Bonus แต้ม Social เพราะคุยกับ Ignis
        onClose();
    };

    // Helper เลือกไอคอน
    const getIcon = (type: string) => {
        switch (type) {
            case 'MEAL': return <Utensils size={16} className="text-orange-500" />;
            case 'WORK': return <Sparkles size={16} className="text-amber-500" />;
            case 'REST': return <Coffee size={16} className="text-blue-500" />;
            default: return <Clock size={16} className="text-slate-500" />;
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
                            <h2 className="font-medieval text-xl text-[#D4AF37]">Daily Strategist</h2>
                            <p className="text-xs text-amber-300/60 uppercase tracking-widest">Elder Ignis Planning</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#D7C4A1] hover:text-white">✕</button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {step === 'MOOD' && (
                            <motion.div key="mood" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                <h3 className="text-2xl font-medieval text-[#2C1810] text-center">Energy Check</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <button onClick={() => { setMood('TIRED'); setStep('FOCUS'); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-amber-50 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-slate-200 rounded-full"><Battery size={24} className="text-slate-600" /></div>
                                        <span className="font-bold text-[#5D4037]">Low Battery (Recovery Mode)</span>
                                    </button>
                                    <button onClick={() => { setMood('NEUTRAL'); setStep('FOCUS'); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-amber-50 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-blue-100 rounded-full"><BatteryCharging size={24} className="text-blue-600" /></div>
                                        <span className="font-bold text-[#5D4037]">Balanced (Normal Day)</span>
                                    </button>
                                    <button onClick={() => { setMood('ENERGETIC'); setStep('FOCUS'); }} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-amber-50 flex items-center gap-4 transition-all group">
                                        <div className="p-3 bg-amber-100 rounded-full"><Zap size={24} className="text-amber-600" /></div>
                                        <span className="font-bold text-[#5D4037]">Full Power (War Mode)</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'FOCUS' && (
                            <motion.div key="focus" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                <h3 className="text-2xl font-medieval text-[#2C1810] text-center">Today's Mission?</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <button onClick={() => generateSchedule('STUDY')} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-blue-50 flex items-center gap-4 transition-all">
                                        <div className="p-3 bg-blue-100 rounded-full"><Brain size={24} className="text-blue-600" /></div>
                                        <span className="font-bold text-[#5D4037]">Wisdom (IELTS / Study)</span>
                                    </button>
                                    <button onClick={() => generateSchedule('HEALTH')} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-red-50 flex items-center gap-4 transition-all">
                                        <div className="p-3 bg-red-100 rounded-full"><Dumbbell size={24} className="text-red-600" /></div>
                                        <span className="font-bold text-[#5D4037]">Vitality (Exercise / Health)</span>
                                    </button>
                                    <button onClick={() => generateSchedule('CREATION')} className="p-4 border-2 border-[#D7C4A1] rounded-lg hover:bg-purple-50 flex items-center gap-4 transition-all">
                                        <div className="p-3 bg-purple-100 rounded-full"><Palette size={24} className="text-purple-600" /></div>
                                        <span className="font-bold text-[#5D4037]">Creation (Code / Project)</span>
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
                            <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                                <div className="bg-[#2C1810]/5 p-4 rounded-lg border border-[#D7C4A1] italic text-center font-serif text-[#5D4037] text-sm">
                                    "{aiResponse.quote}"
                                </div>

                                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="relative border-l-2 border-[#D4AF37] ml-4 space-y-6 py-2">
                                        {aiResponse.schedule.map((item, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#FDF6E3] border-2 border-[#D4AF37] flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-[#2C1810]"></div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-[#D4AF37] bg-[#2C1810] px-2 py-0.5 rounded w-fit mb-1">
                                                        {item.time}
                                                    </span>
                                                    <div className="flex items-start gap-2">
                                                        <div className="mt-1">{getIcon(item.type)}</div>
                                                        <span className="text-sm font-semibold text-[#5D4037]">{item.activity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button onClick={() => setStep('FOCUS')} className="flex-1 py-3 border-2 border-[#2C1810] text-[#2C1810] font-medieval rounded-lg hover:bg-amber-50 transition">
                                        Retry
                                    </button>
                                    <button onClick={acceptSchedule} className="flex-[2] py-3 bg-[#2C1810] text-[#D4AF37] font-medieval rounded-lg hover:bg-black transition shadow-lg flex items-center justify-center gap-2">
                                        <Sparkles size={18} />
                                        Commit Plan
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
