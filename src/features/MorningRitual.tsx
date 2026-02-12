import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragonStore } from '../logic/dragonStore';
import type { Task, DaySummary } from '../logic/dragonStore';
import { geminiService } from '../logic/GeminiService';
import {
    Sun, Battery, BatteryCharging, Zap, Sparkles,
    Dumbbell, Utensils, Clock, Coffee, Scroll, ChevronRight, Send, User, Bot
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface MorningRitualProps {
    onClose: () => void;
}

type Mood = 'TIRED' | 'NEUTRAL' | 'ENERGETIC';

interface ScheduleItem {
    time: string;
    activity: string;
    type: 'MEAL' | 'WORK' | 'REST' | 'ROUTINE' | 'EXERCISE';
    details?: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    scheduleProposal?: { schedule: ScheduleItem[], rationale: string };
}

const MorningRitual: React.FC<MorningRitualProps> = ({ onClose }) => {
    const { addHabit, addTask, userProfile, dailyHistory } = useDragonStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [step, setStep] = useState<'BRIEFING' | 'MOOD' | 'CHAT'>('MOOD');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState<ScheduleItem[] | null>(null);
    const [yesterday, setYesterday] = useState<DaySummary | null>(null);

    useEffect(() => {
        if (dailyHistory && dailyHistory.length > 0) {
            const lastEntry = dailyHistory[dailyHistory.length - 1];
            // setYesterday(lastEntry); // Optional: Re-enable if briefing is desired
            // setStep('BRIEFING');
        }
    }, [dailyHistory]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startChat = async (selectedMood: Mood) => {
        setStep('CHAT');
        setIsLoading(true);

        const initialUserMsg: Message = { id: uuidv4(), role: 'user', content: `I'm feeling ${selectedMood.toLowerCase()} today.` };
        setMessages([initialUserMsg]);

        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const recentHistory = dailyHistory.slice(-3);

        try {
            // Initial Generation
            const result = await geminiService.generatePersonalizedSchedule(
                selectedMood,
                recentHistory,
                userProfile || { name: 'Keeper' },
                currentTime
            );

            if (result) {
                const aiMsg: Message = {
                    id: uuidv4(),
                    role: 'assistant',
                    content: result.quote,
                    scheduleProposal: {
                        schedule: result.schedule,
                        rationale: result.rationale
                    }
                };
                setCurrentSchedule(result.schedule);
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: "My connection to the stars is weak... Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = { id: uuidv4(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Negotiation Logic
            const result = await geminiService.negotiateSchedule(
                currentSchedule || [],
                userMsg.content,
                userProfile || { name: 'Keeper' }
            );

            if (result) {
                const aiMsg: Message = {
                    id: uuidv4(),
                    role: 'assistant',
                    content: result.rationale || "I've adjusted the plan.",
                    scheduleProposal: {
                        schedule: result.schedule,
                        rationale: result.rationale
                    }
                };
                setCurrentSchedule(result.schedule);
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: "I couldn't quite catch that. Could you rephrase?" }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: "The threads of fate are tangled. I cannot adjust the plan right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const acceptSchedule = () => {
        if (!currentSchedule) return;

        currentSchedule.forEach(item => {
            const [hours, minutes] = item.time.split(':').map(Number);
            const scheduleDate = new Date();
            scheduleDate.setHours(hours, minutes, 0, 0);
            const expiresAt = scheduleDate.getTime() + (2 * 60 * 60 * 1000);

            if (['MEAL', 'REST', 'EXERCISE'].includes(item.type)) {
                let habitType: 'HEALTH' | 'STUDY' | 'SOCIAL' | 'GOLD' = 'HEALTH';
                if (item.type === 'EXERCISE') habitType = 'HEALTH';
                addHabit(`[${item.time}] ${item.activity}`, habitType, expiresAt);
            } else {
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
                className="bg-[#FDF6E3] w-full max-w-2xl rounded-xl shadow-2xl border-2 border-[#8B4513] overflow-hidden flex flex-col h-[85vh]"
            >
                {/* Header */}
                <div className="bg-[#2C1810] p-4 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 border-2 border-[#D4AF37] flex items-center justify-center">
                            <Sun className="text-[#2C1810]" />
                        </div>
                        <div>
                            <h2 className="font-medieval text-xl text-[#D4AF37]">Daily Strategist</h2>
                            <p className="text-xs text-amber-300/60 uppercase tracking-widest">Elder Ignis Negotiation</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#D7C4A1] hover:text-white">✕</button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#FDF6E3] space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 'MOOD' ? (
                            <motion.div
                                key="mood"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="h-full flex flex-col items-center justify-center space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <h3 className="text-3xl font-medieval text-[#2C1810]">How flows your energy?</h3>
                                    <p className="text-[#5D4037] italic">"The stars await your command, Keeper."</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-xl">
                                    {[
                                        { id: 'TIRED', label: 'Low Tide', icon: Battery, desc: 'Recovery Focus', color: 'bg-slate-200 text-slate-700' },
                                        { id: 'NEUTRAL', label: 'Steady Flow', icon: BatteryCharging, desc: 'Balanced Growth', color: 'bg-blue-100 text-blue-700' },
                                        { id: 'ENERGETIC', label: 'Raging Fire', icon: Zap, desc: 'Maximum Effort', color: 'bg-amber-100 text-amber-700' }
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => startChat(m.id as Mood)}
                                            className="flex flex-col items-center p-6 rounded-2xl border-2 border-[#D7C4A1] bg-white hover:border-amber-500 hover:shadow-xl transition-all group gap-4"
                                        >
                                            <div className={`p-4 rounded-full ${m.color} group-hover:scale-110 transition-transform`}>
                                                <m.icon size={32} />
                                            </div>
                                            <div className="text-center">
                                                <h4 className="font-bold text-[#2C1810] text-lg">{m.label}</h4>
                                                <p className="text-xs text-[#8D6E63] mt-1 uppercase tracking-wide">{m.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#5D4037] text-[#EDE0C8]' : 'bg-[#D4AF37] text-[#2C1810]'}`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>

                                        <div className={`max-w-[80%] space-y-4`}>
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                                    ? 'bg-[#5D4037] text-[#EDE0C8] rounded-tr-none'
                                                    : 'bg-white border border-[#D7C4A1] text-[#2C1810] rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>

                                            {/* Schedule Proposal Card */}
                                            {msg.scheduleProposal && (
                                                <div className="bg-white rounded-xl border-2 border-[#D4AF37] overflow-hidden shadow-md">
                                                    <div className="bg-[#FFF8E1] p-3 border-b border-[#D7C4A1] flex justify-between items-center">
                                                        <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest flex items-center gap-2">
                                                            <Scroll size={14} /> Proposed Schedule
                                                        </span>
                                                    </div>
                                                    <div className="divide-y divide-[#F0E6D2]">
                                                        {msg.scheduleProposal.schedule.map((item, idx) => (
                                                            <div key={idx} className="p-3 flex items-center gap-4 hover:bg-[#FAFAFA]">
                                                                <span className="flex-shrink-0 w-16 text-xs font-bold text-[#D4AF37] bg-[#2C1810] px-2 py-1 rounded text-center">
                                                                    {item.time}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-[#5D4037] truncate">{item.activity}</p>
                                                                    {item.details && <p className="text-xs text-[#8D6E63] truncate">{item.details}</p>}
                                                                </div>
                                                                <div>{getIcon(item.type)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-[#8D6E63] text-sm animate-pulse ml-12">
                                        <Sparkles size={16} /> Elder Ignis is thinking...
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Area (Only in Chat) */}
                {step === 'CHAT' && (
                    <div className="p-4 bg-white border-t border-[#D7C4A1] flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                placeholder="Suggest a change (e.g., 'Move reading to 5 PM', 'I need a nap')..."
                                className="w-full bg-[#FDF6E3] border border-[#D7C4A1] rounded-xl p-3 pr-10 text-sm focus:outline-none focus:border-amber-500 text-[#2C1810] placeholder-[#BCAAA4] resize-none custom-scrollbar"
                                rows={1}
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputValue.trim()}
                            className="p-3 bg-[#2C1810] text-[#D4AF37] rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                )}

                {/* Accept Button (Overlay or Toolbar) */}
                {step === 'CHAT' && currentSchedule && !isLoading && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 w-auto">
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={acceptSchedule}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medieval text-lg rounded-full shadow-[0_4px_14px_rgba(217,119,6,0.5)] hover:shadow-xl hover:scale-105 transition-all border-2 border-white/20"
                        >
                            <Sparkles size={18} className="fill-current" />
                            Seal the Pact
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default MorningRitual;
