import React, { useState } from 'react';
import { geminiService } from '../logic/GeminiService';
import { useDragonStore } from '../logic/dragonStore'; // Import DragonStore
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Scroll, CheckCircle, Brain, RefreshCw, Feather, Lock, Flame } from 'lucide-react';
import { useSound } from '../logic/soundStore';
import DragonEncounter from './DragonEncounter';

type LessonMode = 'VOCAB' | 'GRAMMAR' | 'MOCK';

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

interface MockExam {
    type: 'WRITING' | 'SPEAKING';
    question: string;
    feedback?: string;
    score?: number;
    tips?: string[];
}

interface QuizItem {
    question: string;
    options: string[];
    correctIndex: number;
}

interface LessonData {
    mode: LessonMode;
    content: VocabItem[] | GrammarPoint | MockExam;
    quiz?: QuizItem[];
}


const DragonLessons: React.FC = () => {
    const { playSound } = useSound();
    const { gainXp, summonCharge, addSummonCharge, habits, activeEgg, ielts, updateIELTS, addVocab } = useDragonStore(); // Unified store usage

    const [mode, setMode] = useState<LessonMode>('VOCAB');
    const [mockType, setMockType] = useState<'WRITING' | 'SPEAKING'>('WRITING');
    const [loading, setLoading] = useState(false);
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [userResponse, setUserResponse] = useState('');
    const [grading, setGrading] = useState(false);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    // const [quizAnswers, setQuizAnswers] = useState<string[]>([]); // Removed unused
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
        setUserResponse('');
        setGrading(false);
        setShowQuiz(false);
        setQuizIndex(0);
        setQuizScore(0);
        // setQuizAnswers([]); // Removed unused
        playSound('CLICK');

        let prompt = "";
        if (selectedMode === 'VOCAB') {
            prompt = "Generate 3 useful English vocabulary words (IELTS Band 6-8) that are practical for essays/speaking. Include precise definitions, 2 synonyms, and a clear example sentence for each. ALSO generate a simple 3-question multiple-choice quiz testing these words. Return ONLY a JSON object with keys: 'items' (array of {word, definition, synonyms, example}) and 'quiz' (array of {question, options (array of 4 strings), correctIndex (0-3)}).";
        } else if (selectedMode === 'GRAMMAR') {
            prompt = "Explain one essential English grammar concept (IELTS Band 6-8) like Passive Voice, Relative Clauses, or Conditionals. Provide a clear explanation and 2 example sentences. ALSO generate a 3-question quiz testing this concept. Return ONLY a JSON object with keys: {topic, explanation, example, quiz: [{question, options, correctIndex}]}.";
        } else if (selectedMode === 'MOCK') {
            const type = mockType; // Use current mockType state
            prompt = type === 'WRITING'
                ? "Generate a common IELTS Writing Task 2 Essay question on a general topic (Education, Health, Work). Return ONLY a JSON object with keys: {type: 'WRITING', question: 'The question text...'}."
                : "Generate an IELTS Speaking Part 2 Cue Card topic. Return ONLY a JSON object with keys: {type: 'SPEAKING', question: 'Describe a time when... You should say: ...'}."
        }

        try {
            const data = await geminiService.generateJSON<any>(prompt);

            if (data) {
                if (selectedMode === 'VOCAB' && data.items) {
                    setLesson({ mode: 'VOCAB', content: data.items, quiz: data.quiz });
                } else if (selectedMode === 'GRAMMAR' && data.topic) {
                    setLesson({ mode: 'GRAMMAR', content: data, quiz: data.quiz });
                } else if (selectedMode === 'MOCK' && data.question) {
                    setLesson({ mode: 'MOCK', content: data });
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

    const submitMockExam = async () => {
        if (!lesson || lesson.mode !== 'MOCK' || !userResponse.trim()) return;

        setGrading(true);
        playSound('CLICK');

        const mockContent = lesson.content as MockExam;
        const prompt = `Grade this IELTS ${mockContent.type} response based on official criteria (0-9 Band).
        Question: "${mockContent.question}"
        Response: "${userResponse}"
        Return ONLY a JSON object with keys: { score: number, feedback: "Short summary", tips: ["Tip 1", "Tip 2", "Tip 3"] }.`;

        try {
            const result = await geminiService.generateJSON<any>(prompt);
            if (result && result.score !== undefined) {
                const updatedContent = { ...mockContent, ...result };
                setLesson({ ...lesson, content: updatedContent });

                // Update Store
                const scoreChange = result.score >= 7 ? 0.2 : 0.1;
                if (mockContent.type === 'WRITING') {
                    updateIELTS({
                        writing: Math.min(9, ielts.writing + scoreChange),
                    });
                } else {
                    updateIELTS({
                        speaking: Math.min(9, ielts.speaking + scoreChange),
                    });
                }

                gainXp(100);
                addSummonCharge(30);
                playSound('LEVEL_UP');
            }
        } catch (err) {
            alert("Grading failed. The Oracle is confused.");
        } finally {
            setGrading(false);
        }
    };

    const handleComplete = (quizSuccess?: boolean) => {
        let xpGain = 50;
        let chargeGain = 20;
        let msg = "Knowledge absorbed! +50 XP, +20% Boss Charge";

        if (quizSuccess) {
            xpGain += 50;
            chargeGain += 10;
            msg = "Perfect Quiz! +100 XP, +30% Boss Charge";
        } else if (quizSuccess === false) {
            msg = "Lesson Complete. +50 XP, +20% Boss Charge";
        }

        gainXp(xpGain);
        addSummonCharge(chargeGain);

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
                    <button
                        onClick={() => generateLesson('MOCK')}
                        disabled={loading}
                        className={`px-6 py-3 rounded-sm font-bold font-medieval tracking-widest transition-all flex items-center gap-2 border-2 ${mode === 'MOCK' ? 'bg-[#2C1810] text-[#D4AF37] border-[#D4AF37]' : 'bg-[#FDF6E3] text-[#5D4037] border-[#D7C4A1] hover:bg-white'}`}
                    >
                        <Brain size={18} /> MOCK EXAM
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 glass-panel p-8 relative min-h-[400px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-[#FDF6E3] opacity-40 -z-10" />

                {loading || grading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-[#D4AF37] flex flex-col items-center gap-4"
                    >
                        <RefreshCw size={64} />
                        <span className="font-medieval text-xl text-[#2C1810]">{grading ? "The Elders are judging..." : "Consulting the Oracle..."}</span>
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

                                                <div className="mt-auto bg-[#FDF6E3] p-3 rounded-sm border-l-4 border-[#D4AF37] mb-3">
                                                    <p className="text-sm text-[#5D4037] font-serif">"{item.example}"</p>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addVocab(item.word, item.definition, 'n', item.example); // Default to 'n' if not provided, or improve parser later
                                                        playSound('CLICK');
                                                        alert(`"${item.word}" inscribed in Grimoire!`);
                                                    }}
                                                    className="w-full py-2 bg-[#2C1810] text-[#D4AF37] text-xs font-bold uppercase tracking-widest rounded hover:bg-[#3E2723] flex items-center justify-center gap-2"
                                                >
                                                    <BookOpen size={14} /> Inscribe
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : lesson.mode === 'GRAMMAR' ? (
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
                                ) : (
                                    <div className="max-w-3xl mx-auto bg-white/90 p-8 rounded-xl border-2 border-[#D7C4A1] shadow-xl">
                                        <div className="flex justify-between items-start mb-6 border-b border-[#D7C4A1] pb-4">
                                            <div>
                                                <span className="text-xs font-bold text-[#8B4513] uppercase tracking-widest block mb-1">Target Skill</span>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => setMockType('WRITING')}
                                                        className={`font-medieval text-xl ${mockType === 'WRITING' ? 'text-[#2C1810] underline decoration-[#D4AF37]' : 'text-slate-400'}`}
                                                    >
                                                        WRITING TASK 2
                                                    </button>
                                                    <button
                                                        onClick={() => setMockType('SPEAKING')}
                                                        className={`font-medieval text-xl ${mockType === 'SPEAKING' ? 'text-[#2C1810] underline decoration-[#D4AF37]' : 'text-slate-400'}`}
                                                    >
                                                        SPEAKING PART 2
                                                    </button>
                                                </div>
                                            </div>
                                            {(lesson.content as MockExam).score !== undefined && (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-[#8B4513] uppercase">Band Score</span>
                                                    <span className="text-4xl font-bold font-serif text-[#D4AF37] drop-shadow-sm">{(lesson.content as MockExam).score}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-6 bg-[#FDF6E3] p-6 rounded border-l-4 border-[#2C1810]">
                                            <h3 className="font-bold text-[#2C1810] mb-2 font-serif text-lg">Question:</h3>
                                            <p className="text-[#5D4037] italic text-lg leading-relaxed">"{(lesson.content as MockExam).question}"</p>
                                        </div>

                                        {(lesson.content as MockExam).feedback ? (
                                            <div className="space-y-6 animate-fade-in">
                                                <div className="bg-emerald-50 p-6 rounded border border-emerald-200">
                                                    <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                                                        <CheckCircle size={20} /> Examiner Feedback
                                                    </h3>
                                                    <p className="text-emerald-900">{(lesson.content as MockExam).feedback}</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {(lesson.content as MockExam).tips?.map((tip, i) => (
                                                        <div key={i} className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-600 font-medium">
                                                            💡 {tip}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <textarea
                                                    className="w-full h-48 bg-[#FAFAFA] border border-[#D7C4A1] rounded p-4 text-[#2C1810] font-serif text-lg focus:border-[#D4AF37] outline-none resize-none shadow-inner"
                                                    placeholder={mockType === 'WRITING' ? "Write your essay here..." : "Transcribe your spoken answer here..."}
                                                    value={userResponse}
                                                    onChange={e => setUserResponse(e.target.value)}
                                                />
                                                <p className="text-xs text-slate-400 text-right">
                                                    {mockType === 'WRITING' ? `${userResponse.split(' ').filter(w => w).length} words` : "Speak clearly and transcribe accurately."}
                                                </p>
                                                <button
                                                    onClick={submitMockExam}
                                                    disabled={grading || !userResponse.trim()}
                                                    className={`w-full py-4 text-xl font-bold font-medieval tracking-widest rounded transition-all ${!userResponse.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#2C1810] text-[#D4AF37] hover:bg-[#3E2723] shadow-lg'}`}
                                                >
                                                    {grading ? 'EVALUATING...' : 'SUBMIT FOR GRADING'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Quiz Section */}
                        {showQuiz && lesson.quiz && (
                            <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-8 animate-fade-in">
                                <h2 className="text-3xl font-medieval text-[#2C1810] mb-8">Knowledge Check</h2>

                                {quizIndex < lesson.quiz.length ? (
                                    <div className="w-full max-w-2xl">
                                        <div className="flex justify-between mb-4 text-[#8B4513] font-bold">
                                            <span>Question {quizIndex + 1}/{lesson.quiz.length}</span>
                                            <span>Score: {quizScore}</span>
                                        </div>
                                        <div className="bg-[#FDF6E3] p-6 rounded-lg border-2 border-[#D7C4A1] mb-6">
                                            <p className="text-xl text-[#2C1810] font-serif">{lesson.quiz[quizIndex].question}</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {lesson.quiz[quizIndex].options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        const isCorrect = idx === lesson.quiz![quizIndex].correctIndex;
                                                        if (isCorrect) {
                                                            setQuizScore(s => s + 1);
                                                            playSound('SUCCESS');
                                                        } else {
                                                            playSound('ERROR');
                                                        }

                                                        if (quizIndex < lesson.quiz!.length - 1) {
                                                            setQuizIndex(i => i + 1);
                                                        } else {
                                                            // Quiz Finished
                                                            setQuizIndex(i => i + 1);
                                                            if (isCorrect) handleComplete(true); // Bonus XP
                                                            else handleComplete(false);
                                                        }
                                                    }}
                                                    className="p-4 bg-white border border-slate-300 rounded hover:bg-[#D4AF37] hover:text-[#2C1810] transition-colors text-left font-serif text-lg text-slate-700"
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
                                        <p className="text-xl mb-6">You scored {quizScore}/{lesson.quiz.length}</p>
                                        <button
                                            onClick={() => {
                                                setShowQuiz(false);
                                                setLesson(null); // Return to menu
                                            }}
                                            className="px-6 py-2 bg-[#2C1810] text-[#D4AF37] rounded font-bold"
                                        >
                                            Return to Academy
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {lesson.mode !== 'MOCK' && !showQuiz && (
                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    onClick={() => {
                                        if (lesson.quiz) {
                                            setShowQuiz(true);
                                        } else {
                                            handleComplete();
                                        }
                                    }}
                                    className="px-8 py-3 bg-[#D4AF37] text-[#2C1810] font-bold font-medieval text-xl rounded shadow-lg border border-[#B08D55] hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <CheckCircle size={24} /> {lesson.quiz ? "Take Quiz & Complete" : "Mark Lesson Complete"}
                                </button>
                            </div>
                        )}

                        {lesson.mode === 'MOCK' && (lesson.content as MockExam).score !== undefined && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => generateLesson('MOCK')} // Reset for new
                                    className="px-8 py-3 bg-[#2C1810] text-[#D4AF37] font-bold font-medieval text-xl rounded shadow-lg border border-[#B08D55] hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <RefreshCw size={24} /> Take Another Exam
                                </button>
                            </div>
                        )}
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
