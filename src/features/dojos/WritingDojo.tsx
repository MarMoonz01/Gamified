import React, { useState, useEffect } from 'react';
import { useDragonStore } from '../../logic/dragonStore';
import { geminiService } from '../../logic/GeminiService';
import { motion } from 'framer-motion';
import { PenTool, Clock, CheckCircle, Flame, Sword, RefreshCw } from 'lucide-react';
import { useSound } from '../../logic/soundStore';
import Parchment from '../../components/ui/Parchment';

const WritingDojo: React.FC = () => {
    const { playSound } = useSound();
    const { gainXp, addSummonCharge, submitExamResult } = useDragonStore();

    const [essay, setEssay] = useState('');
    const [topic, setTopic] = useState("Some people believe that the government should spend money on faster public transport. Others think that money should be spent on other priorities (e.g., cost environment). Discuss both views and give your opinion.");
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [grading, setGrading] = useState(false);
    const [result, setResult] = useState<{ score: number; feedback: string; powerWords: string[] } | null>(null);

    // Structure Checklist state
    const [structure, setStructure] = useState({
        intro: false,
        body1: false,
        body2: false,
        conclusion: false
    });

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (isTimerRunning) {
            interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const wordCount = essay.trim().split(/\s+/).filter(w => w).length;

    const generateTopic = async () => {
        setTopic("Summoning new topic...");
        try {
            const prompt = "Generate a challenging IELTS Writing Task 2 topic about Technology, Environment, or Society.";
            const data = await geminiService.generateJSON<{ topic: string }>(`${prompt} JSON: {topic: "..."}`);
            if (data?.topic) setTopic(data.topic);
        } catch (e) {
            setTopic("Discuss the advantages and disadvantages of online learning.");
        }
    };

    const submitEssay = async () => {
        if (!essay.trim()) return;
        setGrading(true);
        playSound('CLICK');
        setIsTimerRunning(false);

        const prompt = `Act as a Strict IELTS Examiner. Grade this Task 2 essay.
        Topic: "${topic}"
        Essay: "${essay}"
        
        Identify "Power Words" (Band 7+ vocabulary used correctly).
        
        Return JSON: {
            score: number (0-9),
            feedback: "Concise feedback on TR, CC, LR, GRA.",
            powerWords: ["word1", "word2"]
        }`;

        try {
            const data = await geminiService.generateJSON<{ score: number, feedback: string, powerWords: string[] }>(prompt);
            if (data && data.score !== undefined) {
                setResult(data);
                submitExamResult('WRITING', data.score);
                gainXp(data.score * 20);
                addSummonCharge(15);
                playSound('LEVEL_UP');
            }
        } catch (e) {
            alert("The Examiner is silent. (AI Error)");
        } finally {
            setGrading(false);
        }
    };

    // Power Word Highlighter
    const renderEssayWithHighlights = () => {
        if (!result) return essay;
        let html = essay;
        result.powerWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            html = html.replace(regex, `<span class="text-fantasy-gold font-bold bg-black/20 px-1 rounded">${word}</span>`);
        });
        return <div dangerouslySetInnerHTML={{ __html: html }} className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-fantasy-wood-dark" />;
    };

    return (
        <div className="w-full h-full p-4 flex flex-col gap-4 max-w-6xl mx-auto">
            {/* Header / Toolbar */}
            <div className="flex justify-between items-center bg-fantasy-paper-dark p-4 rounded-lg border-2 border-fantasy-wood/30 shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-900 text-red-100 rounded-lg">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-medieval text-fantasy-wood-dark">The Forge</h1>
                        <div className="flex gap-4 text-xs font-mono text-fantasy-wood/60">
                            <span className="flex items-center gap-1"><PenTool size={12} /> {wordCount} Words</span>
                            <span className={`flex items-center gap-1 ${isTimerRunning ? 'text-red-600 animate-pulse' : ''}`}>
                                <Clock size={12} /> {formatTime(timeElapsed)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-2 border border-fantasy-wood/30 rounded hover:bg-fantasy-wood/10">
                        {isTimerRunning ? 'PAUSE' : 'START TIMER'}
                    </button>
                    <button onClick={generateTopic} className="p-2 border border-fantasy-wood/30 rounded hover:bg-fantasy-wood/10" title="New Topic">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Main Writing Area */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Topic Card */}
                    <div className="bg-fantasy-paper p-6 rounded-lg border-l-4 border-red-800 shadow-inner">
                        <h3 className="font-bold text-red-900 uppercase tracking-widest text-xs mb-2">Current Task</h3>
                        <p className="font-serif text-xl italic text-fantasy-wood-dark leading-relaxed">
                            "{topic}"
                        </p>
                    </div>

                    {/* Editor */}
                    <Parchment className="flex-1 relative flex flex-col p-8" variant="clean">
                        {result ? (
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {renderEssayWithHighlights()}
                            </div>
                        ) : (
                            <textarea
                                className="flex-1 w-full h-full bg-transparent border-none outline-none resize-none font-serif text-lg leading-relaxed text-fantasy-wood-dark placeholder:text-fantasy-wood/20"
                                placeholder="Ignite your arguments here..."
                                value={essay}
                                onChange={e => setEssay(e.target.value)}
                                spellCheck="false"
                            />
                        )}

                        {/* Action Bar */}
                        <div className="flex justify-end mt-4 pt-4 border-t border-fantasy-wood/10">
                            {result ? (
                                <button
                                    onClick={() => { setResult(null); setEssay(''); setTimeElapsed(0); }}
                                    className="px-6 py-2 bg-fantasy-wood text-fantasy-paper font-bold rounded"
                                >
                                    FORGE NEW ESSAY
                                </button>
                            ) : (
                                <button
                                    onClick={submitEssay}
                                    disabled={grading || !essay}
                                    className="px-8 py-3 bg-red-800 text-white font-medieval text-xl rounded shadow-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {grading ? 'TEMPERING...' : 'STRIKE! (SUBMIT)'} <Sword size={20} />
                                </button>
                            )}
                        </div>
                    </Parchment>
                </div>

                {/* Sidebar Tools */}
                <div className="w-80 flex flex-col gap-4">
                    {/* Structure Checklist */}
                    <div className="bg-white/60 p-4 rounded-lg border-2 border-fantasy-wood/20">
                        <h3 className="font-bold text-fantasy-wood-dark mb-3 uppercase text-xs tracking-widest flex items-center gap-2">
                            <CheckCircle size={14} /> Structure
                        </h3>
                        <div className="space-y-2">
                            {Object.entries(structure).map(([key, val]) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-black/5 p-2 rounded transition">
                                    <input
                                        type="checkbox"
                                        checked={val}
                                        onChange={() => setStructure(prev => ({ ...prev, [key]: !prev[key as keyof typeof structure] }))}
                                        className="w-4 h-4 accent-red-800"
                                    />
                                    <span className="capitalize font-serif text-fantasy-wood-dark">{key.replace(/(\d)/, ' $1')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Result Card */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-fantasy-paper-light p-6 rounded-lg border-2 border-fantasy-gold shadow-xl"
                        >
                            <div className="text-center mb-4">
                                <div className="text-5xl font-medieval text-red-800 mb-1">{result.score}</div>
                                <div className="text-xs uppercase tracking-widest text-red-900/50">Band Score</div>
                            </div>
                            <p className="text-sm text-fantasy-wood-dark italic mb-4 border-t border-b border-fantasy-wood/10 py-2">
                                "{result.feedback}"
                            </p>
                            <div>
                                <div className="text-xs font-bold text-fantasy-gold uppercase mb-2">Power Words Detected</div>
                                <div className="flex flex-wrap gap-1">
                                    {result.powerWords.map(w => (
                                        <span key={w} className="px-2 py-1 bg-fantasy-gold/20 text-fantasy-wood-dark text-xs rounded border border-fantasy-gold/30">{w}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WritingDojo;
