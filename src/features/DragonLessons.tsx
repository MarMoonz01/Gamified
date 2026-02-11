import React, { useState } from 'react';
import { geminiService } from '../logic/GeminiService';
import { useDragonStore } from '../logic/dragonStore'; // Import DragonStore
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Scroll, CheckCircle, Brain, RefreshCw, Feather, Lock, Flame } from 'lucide-react';
import { useSound } from '../logic/soundStore';
import DragonEncounter from './DragonEncounter';

type LessonMode = 'VOCAB' | 'GRAMMAR';

interface VocabItem {
    word: string;
    definition: string;
    synonyms: string[];
    example: string;
}

interface GrammarPoint {
    topic: string;
    explanation: string;
    example: string;
}

interface LessonData {
    mode: LessonMode;
    content: VocabItem[] | GrammarPoint;
}


const DragonLessons: React.FC = () => {
    const { playSound } = useSound();
    const { gainXp, summonCharge, addSummonCharge, habits, activeEgg, ielts, updateIELTS } = useDragonStore(); // Unified store usage

    const [mode, setMode] = useState<LessonMode>('VOCAB');
    const [loading, setLoading] = useState(false);
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [error, setError] = useState('');
    const [showEncounter, setShowEncounter] = useState(false);

    // Calculate Rarity based on Max Streak
    const calculateRarity = () => {
        const maxStreak = Math.max(...habits.map(h => h.streak), 0);
        if (maxStreak >= 7) return 'LEGENDARY';
        if (maxStreak >= 3) return 'RARE';
        return 'COMMON';
    };

    const bossRarity = calculateRarity();
    const canChallenge = summonCharge >= 100 && !activeEgg;

    const generateLesson = async (selectedMode: LessonMode) => {
        setLoading(true);
        setError('');
        setLesson(null);
        setMode(selectedMode);
        playSound('CLICK');

        const prompt = selectedMode === 'VOCAB'
            ? "Generate 3 advanced English vocabulary words (IELTS Band 8-9) with definitions, 2 synonyms, and an example sentence for each. Return ONLY a JSON object with key 'items' which is an array of objects: {word, definition, synonyms (array), example}."
            : "Explain one advanced English grammar concept (IELTS Band 8-9) like Inversion, Mixed Conditionals, or Subjunctive. Provide a clear explanation and an example sentence. Return ONLY a JSON object with keys: {topic, explanation, example}.";

        try {
            const data = await geminiService.generateJSON<any>(prompt);

            if (data) {
                if (selectedMode === 'VOCAB' && data.items) {
                    setLesson({ mode: 'VOCAB', content: data.items });
                } else if (selectedMode === 'GRAMMAR' && data.topic) {
                    setLesson({ mode: 'GRAMMAR', content: data });
                } else {
                    throw new Error("Invalid format from Oracle");
                }
                playSound('SUCCESS');
            } else {
                throw new Error("The Oracle remained silent.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to commune with the Wisdom Engine.");
            playSound('ERROR');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = () => {
        gainXp(50);
        addSummonCharge(20);

        let msg = "Knowledge absorbed! +50 XP, +20% Boss Charge";

        if (mode === 'VOCAB') {
            updateIELTS({
                reading: Math.min(9, ielts.reading + 0.1),
                speaking: Math.min(9, ielts.speaking + 0.1)
            });
            msg += "\n+0.1 Reading, +0.1 Speaking";
        } else {
            updateIELTS({
                writing: Math.min(9, ielts.writing + 0.1),
                reading: Math.min(9, ielts.reading + 0.1)
            });
            msg += "\n+0.1 Writing, +0.1 Reading";
        }

        playSound('LEVEL_UP');
        alert(msg);
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 relative">
            <DragonEncounter
                isOpen={showEncounter}
                onClose={() => setShowEncounter(false)}
                rarity={bossRarity}
            />

            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-[#D4AF37] pb-4">
                <div>
                    <h1 className="text-4xl font-medieval text-[#2C1810] flex items-center gap-3">
                        <BookOpen size={40} className="text-[#D4AF37]" />
                        Dragon Academy
                    </h1>
                    <p className="text-[#5D4037] font-fantasy italic mt-1">
                        "Words have power, Dragon Keeper. Wield them wisely."
                    </p>
                </div>

                {/* Mode Select & Gauge */}
                <div className="flex gap-6 items-center">

                    {/* BOSS GAUGE */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold ${bossRarity === 'LEGENDARY' ? 'text-amber-600' : 'text-slate-500'}`}>
                                {bossRarity} THREAT DETECTED
                            </span>
                            {activeEgg && <span className="text-xs text-red-500 flex items-center gap-1"><Lock size={10} /> Hatchery Full</span>}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-3 bg-slate-300 rounded-full overflow-hidden border border-slate-400 relative">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 to-purple-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${summonCharge}%` }}
                                />
                                {summonCharge >= 100 && (
                                    <motion.div
                                        className="absolute inset-0 bg-white/50"
                                        animate={{ opacity: [0, 0.5, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                )}
                            </div>

                            <button
                                onClick={() => canChallenge && setShowEncounter(true)}
                                disabled={!canChallenge}
                                className={`px-4 py-2 font-bold rounded shadow-lg border flex items-center gap-2 transition-all ${canChallenge
                                    ? 'bg-red-800 text-white border-red-500 hover:bg-red-700 animate-pulse cursor-pointer'
                                    : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed grayscale'
                                    }`}
                            >
                                <Flame size={18} className={canChallenge ? "animate-bounce" : ""} />
                                {summonCharge < 100 ? `${summonCharge}% CHARGED` : "CHALLENGE BOSS"}
                            </button>
                        </div>
                    </div>

                    <div className="h-10 w-px bg-[#D4AF37]/50 mx-2" />

                    <button
                        onClick={() => generateLesson('VOCAB')}
                        disabled={loading}
                        className={`px-6 py-3 rounded-sm font-bold font-medieval tracking-widest transition-all flex items-center gap-2 border-2 ${mode === 'VOCAB' ? 'bg-[#2C1810] text-[#D4AF37] border-[#D4AF37]' : 'bg-[#FDF6E3] text-[#5D4037] border-[#D7C4A1] hover:bg-white'}`}
                    >
                        <Scroll size={18} /> VOCABULARY
                    </button>
                    <button
                        onClick={() => generateLesson('GRAMMAR')}
                        disabled={loading}
                        className={`px-6 py-3 rounded-sm font-bold font-medieval tracking-widest transition-all flex items-center gap-2 border-2 ${mode === 'GRAMMAR' ? 'bg-[#2C1810] text-[#D4AF37] border-[#D4AF37]' : 'bg-[#FDF6E3] text-[#5D4037] border-[#D7C4A1] hover:bg-white'}`}
                    >
                        <Feather size={18} /> GRAMMAR
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 glass-panel p-8 relative min-h-[400px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-[#FDF6E3] opacity-40 -z-10" />

                {loading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-[#D4AF37]"
                    >
                        <RefreshCw size={64} />
                    </motion.div>
                ) : error ? (
                    <div className="text-center text-red-800">
                        <Brain size={48} className="mx-auto mb-4 opacity-50" />
                        <h3 className="tex-xl font-bold font-medieval">Connection Severed</h3>
                        <p>{error}</p>
                        <p className="text-xs mt-2">Check your API Key in Settings.</p>
                    </div>
                ) : lesson ? (
                    <div className="w-full max-w-4xl h-full flex flex-col">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1"
                            >
                                {lesson.mode === 'VOCAB' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                                        {(lesson.content as VocabItem[]).map((item, idx) => (
                                            <div key={idx} className="bg-white/60 p-6 rounded border-2 border-[#D7C4A1] flex flex-col relative group hover:-translate-y-1 transition-transform">
                                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#2C1810] text-[#D4AF37] flex items-center justify-center rounded-full font-bold font-medieval shadow-md">
                                                    {idx + 1}
                                                </div>
                                                <h3 className="text-2xl font-bold text-[#2C1810] font-serif mb-2">{item.word}</h3>
                                                <p className="text-[#5D4037] italic mb-4 border-b border-[#D7C4A1]/50 pb-2">{item.definition}</p>

                                                <div className="mb-4">
                                                    <span className="text-xs font-bold uppercase text-[#8B4513]">Synonyms:</span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {item.synonyms.map(s => (
                                                            <span key={s} className="px-2 py-1 bg-[#FDF6E3] rounded text-xs text-[#5D4037] border border-[#D7C4A1]">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-auto bg-[#FDF6E3] p-3 rounded-sm border-l-4 border-[#D4AF37]">
                                                    <p className="text-sm text-[#5D4037] font-serif">"{item.example}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="max-w-2xl mx-auto bg-white/60 p-8 rounded-lg border-2 border-[#D7C4A1]">
                                        <h2 className="text-3xl font-medieval text-[#2C1810] mb-6 text-center underline decoration-[#D4AF37] decoration-4 underline-offset-4">
                                            {(lesson.content as GrammarPoint).topic}
                                        </h2>

                                        <div className="text-lg text-[#5D4037] leading-relaxed mb-8 font-serif">
                                            {(lesson.content as GrammarPoint).explanation}
                                        </div>

                                        <div className="bg-[#2C1810] p-6 rounded text-[#FDF6E3] shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Feather size={100} />
                                            </div>
                                            <h4 className="font-bold text-[#D4AF37] uppercase tracking-widest mb-2 text-sm">Valid Example</h4>
                                            <p className="font-serif text-xl italic">"{(lesson.content as GrammarPoint).example}"</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleComplete}
                                className="px-8 py-3 bg-[#D4AF37] text-[#2C1810] font-bold font-medieval text-xl rounded shadow-lg border border-[#B08D55] hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <CheckCircle size={24} /> Mark Lesson Complete
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center opacity-40">
                        <Brain size={80} className="mx-auto mb-6 text-[#8B4513]" />
                        <h2 className="text-3xl font-medieval text-[#2C1810] mb-2">The Scroll is Empty</h2>
                        <p className="text-[#5D4037] text-lg">Select a discipline given by the Elder Dragons to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DragonLessons;
