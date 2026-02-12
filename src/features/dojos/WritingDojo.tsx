import React, { useState, useEffect } from 'react';
import { useDragonStore } from '../../logic/dragonStore';
import { geminiService } from '../../logic/GeminiService';
import { motion } from 'framer-motion';
import { PenTool, Clock, CheckCircle, Flame, Sword, RefreshCw, ArrowLeft, BookOpen, GitCompare } from 'lucide-react';
import { useSound } from '../../logic/soundStore';
import Parchment from '../../components/ui/Parchment';

interface WritingDojoProps {
    onBack: () => void;
}

const WritingDojo: React.FC<WritingDojoProps> = ({ onBack }) => {
    const { playSound } = useSound();
    const { gainXp, addSummonCharge, submitExamResult } = useDragonStore();

    const [essay, setEssay] = useState('');
    const [topic, setTopic] = useState("Some people believe that the government should spend money on faster public transport. Others think that money should be spent on other priorities (e.g., cost environment). Discuss both views and give your opinion.");
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [grading, setGrading] = useState(false);

    // Updated Result State
    const [result, setResult] = useState<{ score: number; feedback: string[]; betterVersion: string; keyChanges: string[] } | null>(null);
    const [activeTab, setActiveTab] = useState<'FEEDBACK' | 'MODEL'>('FEEDBACK');

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

        try {
            const data = await geminiService.evaluateWriting(topic, essay);
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

    return (
        <div className="w-full h-full p-4 flex flex-col gap-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-fantasy-paper-dark p-4 rounded-lg border-2 border-fantasy-wood/30 shadow-md">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-black/10 rounded-full transition-colors text-fantasy-wood-dark">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="p-3 bg-red-900 text-red-100 rounded-lg">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-medieval text-fantasy-wood-dark">The Forge (Writing)</h1>
                        <div className="flex gap-4 text-xs font-mono text-fantasy-wood/60">
                            <span className="flex items-center gap-1"><PenTool size={12} /> {wordCount} Words</span>
                            <span className={`flex items-center gap-1 ${isTimerRunning ? 'text-red-600 animate-pulse' : ''}`}>
                                <Clock size={12} /> {formatTime(timeElapsed)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-2 border border-fantasy-wood/30 rounded hover:bg-fantasy-wood/10 font-bold text-fantasy-wood-dark">
                        {isTimerRunning ? 'PAUSE' : 'START TIMER'}
                    </button>
                    <button onClick={generateTopic} className="p-2 border border-fantasy-wood/30 rounded hover:bg-fantasy-wood/10" title="New Topic">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Topic */}
                    <div className="bg-fantasy-paper p-6 rounded-lg border-l-4 border-red-800 shadow-inner">
                        <h3 className="font-bold text-red-900 uppercase tracking-widest text-xs mb-2">Current Task</h3>
                        <p className="font-serif text-xl italic text-fantasy-wood-dark leading-relaxed">"{topic}"</p>
                    </div>

                    {/* Result View or Editor */}
                    {result ? (
                        <div className="flex-1 bg-fantasy-paper rounded-xl border border-fantasy-wood/20 flex flex-col overflow-hidden">
                            {/* Tabs */}
                            <div className="flex border-b border-fantasy-wood/10 bg-fantasy-wood/5">
                                <button
                                    onClick={() => setActiveTab('FEEDBACK')}
                                    className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'FEEDBACK' ? 'text-red-800 bg-fantasy-paper border-b-2 border-red-800' : 'text-fantasy-wood/50'}`}
                                >
                                    <BookOpen size={18} /> Feedback
                                </button>
                                <button
                                    onClick={() => setActiveTab('MODEL')}
                                    className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'MODEL' ? 'text-red-800 bg-fantasy-paper border-b-2 border-red-800' : 'text-fantasy-wood/50'}`}
                                >
                                    <GitCompare size={18} /> Model Answer (Band 9.0)
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {activeTab === 'FEEDBACK' ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-6">
                                            <div className="text-6xl font-medieval text-red-800">{result.score}</div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-fantasy-wood-dark">Examiner's Verdict</h3>
                                                <p className="text-fantasy-wood/70 text-sm">See improvements below.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {result.feedback.map((f, i) => (
                                                <div key={i} className="bg-red-50 border border-red-100 p-3 rounded text-red-900 flex gap-3">
                                                    <div className="mt-1 shrink-0 bg-red-200 w-2 h-2 rounded-full" />
                                                    {f}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8">
                                            <h4 className="font-bold text-fantasy-wood-dark mb-4 border-b border-fantasy-wood/10 pb-2">Key Improvements needed</h4>
                                            <ul className="space-y-2">
                                                {result.keyChanges.map((change, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-fantasy-wood-dark">
                                                        <Sword size={14} className="text-fantasy-gold" /> {change}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-8 h-full">
                                        <div className="pr-4 border-r border-fantasy-wood/10">
                                            <h4 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-widest">Your Essay</h4>
                                            <div className="font-serif text-lg leading-relaxed text-slate-600 whitespace-pre-wrap">
                                                {essay}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-emerald-600 mb-4 text-xs uppercase tracking-widest">Elder Ignis Rewrite (Band 9.0)</h4>
                                            <div className="font-serif text-lg leading-relaxed text-fantasy-wood-dark whitespace-pre-wrap">
                                                {result.betterVersion}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-fantasy-wood/10 flex justify-between bg-fantasy-wood/5">
                                <span className="text-xs text-fantasy-wood/50 flex items-center gap-1">
                                    <CheckCircle size={12} /> XP Awarded: {result.score * 20}
                                </span>
                                <button
                                    onClick={() => { setResult(null); setEssay(''); setTimeElapsed(0); setIsTimerRunning(false); }}
                                    className="px-6 py-2 bg-fantasy-wood text-fantasy-paper font-bold rounded hover:bg-fantasy-wood-dark transition-colors"
                                >
                                    Forge New Essay
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Parchment className="flex-1 relative flex flex-col p-8" variant="clean">
                            <textarea
                                className="flex-1 w-full h-full bg-transparent border-none outline-none resize-none font-serif text-lg leading-relaxed text-fantasy-wood-dark placeholder:text-fantasy-wood/20"
                                placeholder="Ignite your arguments here..."
                                value={essay}
                                onChange={e => setEssay(e.target.value)}
                                spellCheck="false"
                            />
                            <div className="flex justify-end mt-4 pt-4 border-t border-fantasy-wood/10">
                                <button
                                    onClick={submitEssay}
                                    disabled={grading || !essay}
                                    className="px-8 py-3 bg-red-800 text-white font-medieval text-xl rounded shadow-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {grading ? 'TEMPERING...' : 'STRIKE! (SUBMIT)'} <Sword size={20} />
                                </button>
                            </div>
                        </Parchment>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WritingDojo;
