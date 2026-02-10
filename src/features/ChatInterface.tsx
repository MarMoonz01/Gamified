import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Minimize2, Maximize2, Sparkles, Flame } from 'lucide-react';
import { geminiService } from '../logic/GeminiService';
import { useDragonStore } from '../logic/dragonStore';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const ChatInterface: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // const { playerName, dragons } = useDragonStore(); // Accessed dynamically now or not needed for render?
    // actually we might need it for render if we show player name in UI?
    // Let's check if we use playerName in the UI. 
    // We use it in handleSend only? No.
    // The previous code had: The user is named ${playerName || "Traveler"}. inside handleSend systemContext.
    // But I replaced handleSend to use `state.playerName`.
    // So if it's not used in JSX, we can remove it.

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Build Context
        const contextHistory = messages.slice(-10).map(m => ({
            role: m.role,
            parts: m.text
        }));

        // Initial System Instruction (Implicitly handled by first prompt or history)
        if (messages.length === 0) {
            // We can inject a system prompt as the first history item if the API supported it directly, 
            // but for simple chat, we just send it.
        }

        const state = useDragonStore.getState();
        const { dragons, habits, tasks, getDailyHeat } = state;
        const activeDragon = dragons[0]; // Primary dragon
        const recentHeat = getDailyHeat();

        const systemContext = `
            You are Elder Ignis, an ancient and wise dragon mentor.
            The user is named ${state.playerName || "Traveler"}.
            
            == Current State ==
            Dragon: ${activeDragon ? `${activeDragon.name} (${activeDragon.type}, Lvl ${activeDragon.level}) - Happiness: ${activeDragon.happiness}/100` : "No Dragon (Egg Stage)"}
            Habits: ${habits.map(h => `${h.title} (Streak: ${h.streak})`).join(', ')}
            Pending Tasks: ${tasks.filter(t => !t.completed).map(t => t.title).join(', ')}
            Activity (Last 7 Days Heat): ${recentHeat.join(', ')}
            
            == Instructions ==
            1. Speak with wisdom and metaphors of fire, ancient runes, and growth.
            2. Be OBSERVANT. If happiness is low (<30), scold them gently. If streaks are high, praise them.
            3. If they ask "What should I do?", suggest a task from their list or a habit that is low on streak.
            4. Keep responses concise (under 3 sentences) unless asked for deep lore.
        `;

        try {
            // Prepend system context to the *latest* message effectively, or just rely on persona
            const responseText = await geminiService.generateChat(
                [{ role: 'user', parts: systemContext }, ...contextHistory],
                input
            );

            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
            setMessages(prev => [...prev, aiMsg]);
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "The connection to the ether is weak... (Error)" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Trigger Button (Floating) */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-20 right-4 p-4 bg-gradient-to-br from-[#2C1810] to-[#5D4037] text-[#D4AF37] rounded-full shadow-lg border-2 border-[#D4AF37] z-40 ${isOpen ? 'hidden' : 'flex'}`}
            >
                <MessageSquare size={24} />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={`fixed right-4 bg-[#FDF6E3] border-2 border-[#5D4037] rounded-t-xl shadow-2xl z-50 overflow-hidden flex flex-col ${isMinimized ? 'bottom-0 h-14 w-72' : 'bottom-0 h-[500px] w-96 rounded-b-none'}`}
                    >
                        {/* Header */}
                        <div
                            className="bg-[#2C1810] p-3 flex justify-between items-center cursor-pointer"
                            onClick={() => setIsMinimized(!isMinimized)}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center border border-amber-500">
                                    <Flame size={18} className="text-[#2C1810]" />
                                </div>
                                <div>
                                    <h3 className="font-medieval text-[#D4AF37] leading-none">Elder Ignis</h3>
                                    <span className="text-[10px] text-amber-500/80 uppercase tracking-wider">Soul Companion</span>
                                </div>
                            </div>
                            <div className="flex gap-2 text-[#D4AF37]/60">
                                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:text-[#D4AF37]">
                                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:text-red-400">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                                    {messages.length === 0 && (
                                        <div className="text-center text-[#5D4037]/50 italic text-sm mt-10">
                                            "I am here, young Tamer. What seeks your heart?"
                                        </div>
                                    )}
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[80%] p-3 rounded-lg text-sm font-sans leading-relaxed shadow-sm ${msg.role === 'user'
                                                    ? 'bg-[#2C1810] text-[#E0F7FA] rounded-br-none'
                                                    : 'bg-white border border-[#D7C4A1] text-[#2C1810] rounded-bl-none'
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/50 p-2 rounded-lg text-[#5D4037] text-xs flex items-center gap-1">
                                                <Sparkles size={12} className="animate-spin" /> Divining...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 bg-[#FDF6E3] border-t border-[#D7C4A1]">
                                    <div className="flex gap-2">
                                        <input
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                                            placeholder="Consult the Elder..."
                                            className="flex-1 bg-white border border-[#D7C4A1] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513] text-[#2C1810]"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={loading || !input.trim()}
                                            className="bg-[#8B4513] hover:bg-[#5D4037] text-[#D4AF37] p-2 rounded transition-colors disabled:opacity-50"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatInterface;
