import React, { useState } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import { MOCK_EXAMS, type FullMockExam } from '../data/mockExams';
import { Shield, Clock, AlertTriangle, CheckCircle, ChevronRight, Play, Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import ExamSimulator from './exam/ExamSimulator';

const HallOfRecords: React.FC = () => {
    const { saveExamRecord } = useDragonStore();
    const [selectedExam, setSelectedExam] = useState<FullMockExam | null>(null);
    const [examState, setExamState] = useState<'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'CUSTOM_SIM'>('IDLE');
    const [currentSection, setCurrentSection] = useState<'listening' | 'reading' | 'writing' | 'speaking'>('listening');
    const [timeLeft, setTimeLeft] = useState(0);

    // Custom Exam State
    const [customFile, setCustomFile] = useState<File | null>(null);
    const [customMode, setCustomMode] = useState<'READING' | 'LISTENING' | 'WRITING'>('READING');

    const startExam = (exam: FullMockExam) => {
        setSelectedExam(exam);
        setExamState('IN_PROGRESS');
        setCurrentSection('listening');
        setTimeLeft(exam.sections.listening.durationMinutes * 60);
        // Request Fullscreen
        document.documentElement.requestFullscreen().catch((e) => console.log(e));
    };

    const nextSection = () => {
        if (!selectedExam) return;
        const order: ('listening' | 'reading' | 'writing' | 'speaking')[] = ['listening', 'reading', 'writing', 'speaking'];
        const idx = order.indexOf(currentSection);
        if (idx < 3) {
            const next = order[idx + 1];
            setCurrentSection(next);
            setTimeLeft(selectedExam.sections[next].durationMinutes * 60);
        } else {
            finishExam();
        }
    };

    const finishExam = () => {
        setExamState('COMPLETED');
        document.exitFullscreen().catch((e) => console.log(e));

        // Mock Grading (Random Scores for now, would be real grading logic)
        const mockScores = {
            reading: 7.0,
            listening: 7.5,
            writing: 6.5,
            speaking: 7.0,
            overall: 7.0
        };

        saveExamRecord(mockScores, `Mock Exam: ${selectedExam?.title}`);
    };

    // Timer Effect
    React.useEffect(() => {
        let interval: any;
        if (examState === 'IN_PROGRESS' && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && examState === 'IN_PROGRESS') {
            nextSection(); // Auto advance on timeout
        }
        return () => clearInterval(interval);
    }, [examState, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (examState === 'CUSTOM_SIM' && customFile) {
        return (
            <ExamSimulator
                file={customFile}
                mode={customMode}
                onFinish={() => {
                    setExamState('COMPLETED');
                    // Save record logic here
                }}
                onBack={() => setExamState('IDLE')}
            />
        );
    }

    if (examState === 'IDLE') {
        return (
            <div className="w-full h-full p-8 overflow-y-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-5xl font-medieval text-red-800 mb-2 drop-shadow-md flex items-center justify-center gap-4">
                        <Shield size={48} /> The Hall of Records <Shield size={48} />
                    </h1>
                    <p className="text-fantasy-wood/60 italic font-serif text-lg">
                        "Prove your worth in the crucible of examination."
                    </p>
                </header>

                <div className="max-w-6xl mx-auto mb-12">
                    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-2xl font-bold text-fantasy-gold flex items-center gap-2">
                                <FileText /> Custom Exam Simulator
                            </h2>
                            <p className="text-slate-400">
                                Upload a PDF exam paper (IELTS Cambridge, Mock) and take it in a realistic split-screen environment.
                            </p>

                            {/* Mode Selection */}
                            <div className="flex gap-2 bg-slate-900 p-1 rounded-lg w-fit">
                                {(['READING', 'LISTENING', 'WRITING'] as const).map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setCustomMode(m)}
                                        className={`px-4 py-2 rounded font-bold text-sm transition-colors ${customMode === m ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full md:w-96">
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-600 border-dashed rounded-xl cursor-pointer bg-slate-700/50 hover:bg-slate-700 transition-colors group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400 group-hover:text-fantasy-gold transition-colors">
                                    <Upload className="w-10 h-10 mb-3" />
                                    <p className="mb-2 text-sm font-bold">Click to upload PDF</p>
                                    <p className="text-xs opacity-70">PDF only (MAX 10MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="application/pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setCustomFile(e.target.files[0]);
                                            setExamState('CUSTOM_SIM');
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-fantasy-wood/30" />
                    <span className="text-fantasy-wood/50 font-medieval text-sm uppercase tracking-widest">Or Select a Standard Mock</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-fantasy-wood/30" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {MOCK_EXAMS.map(exam => (
                        <div key={exam.id} className="bg-fantasy-paper p-8 rounded-lg border-2 border-red-900/20 shadow-xl hover:shadow-2xl transition-all group">
                            <h2 className="text-2xl font-bold text-fantasy-wood-dark mb-4 group-hover:text-red-800 transition-colors">
                                {exam.title}
                            </h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm text-fantasy-wood/70 border-b border-fantasy-wood/10 pb-2">
                                    <span>Listening</span>
                                    <span>{exam.sections.listening.durationMinutes}m</span>
                                </div>
                                <div className="flex justify-between text-sm text-fantasy-wood/70 border-b border-fantasy-wood/10 pb-2">
                                    <span>Reading</span>
                                    <span>{exam.sections.reading.durationMinutes}m</span>
                                </div>
                                <div className="flex justify-between text-sm text-fantasy-wood/70 border-b border-fantasy-wood/10 pb-2">
                                    <span>Writing</span>
                                    <span>{exam.sections.writing.durationMinutes}m</span>
                                </div>
                                <div className="flex justify-between text-sm text-fantasy-wood/70 border-b border-fantasy-wood/10 pb-2">
                                    <span>Speaking</span>
                                    <span>{exam.sections.speaking.durationMinutes}m</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-red-900 pt-2">
                                    <span>Total Duration</span>
                                    <span>~{Math.round((exam.sections.listening.durationMinutes + exam.sections.reading.durationMinutes + exam.sections.writing.durationMinutes + exam.sections.speaking.durationMinutes) / 60 * 10) / 10}h</span>
                                </div>
                            </div>
                            <button
                                onClick={() => startExam(exam)}
                                className="w-full py-4 bg-red-900 text-red-100 font-medieval text-xl rounded shadow-lg hover:bg-black transition flex items-center justify-center gap-3"
                            >
                                <Play size={24} fill="currentColor" /> BEGIN SIMULATION
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (examState === 'COMPLETED') {
        return (
            <div className="w-full h-full flex items-center justify-center p-8 bg-black/90 absolute inset-0 z-50">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-12 bg-fantasy-paper rounded-xl border-4 border-fantasy-gold shadow-[0_0_50px_rgba(255,215,0,0.2)] text-center max-w-2xl"
                >
                    <CheckCircle size={80} className="text-green-600 mx-auto mb-6" />
                    <h1 className="text-5xl font-medieval text-fantasy-wood-dark mb-4">Simulation Complete</h1>
                    <p className="text-xl font-serif text-fantasy-wood/80 mb-8">
                        Your performance has been recorded in the archives.
                        The Oracle is analyzing your results...
                    </p>
                    <button
                        onClick={() => window.location.reload()} // Simple way to reset state and return
                        className="px-10 py-4 bg-fantasy-gold text-fantasy-wood-dark font-bold rounded shadow-lg hover:bg-yellow-400"
                    >
                        RETURN TO SANCTUARY
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col text-slate-200">
            {/* Exam Header */}
            <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700 shadow-xl">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {selectedExam?.title}
                    </span>
                    <span className="px-3 py-1 bg-red-900/50 border border-red-500 rounded text-red-300 font-mono flex items-center gap-2">
                        <AlertTriangle size={14} /> DO NOT EXIT FULLSCREEN
                    </span>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-2xl font-mono font-bold text-fantasy-gold flex items-center gap-3">
                        <Clock size={24} /> {formatTime(timeLeft)}
                    </div>
                    <button onClick={nextSection} className="px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded font-bold flex items-center gap-2 transition">
                        NEXT SECTION <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Exam Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Section Sidebar */}
                <div className="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col space-y-2">
                    {['listening', 'reading', 'writing', 'speaking'].map((sec) => (
                        <div
                            key={sec}
                            className={`p-3 rounded text-sm uppercase tracking-widest font-bold flex justify-between ${currentSection === sec ? 'bg-blue-900 text-blue-100 border border-blue-500' : 'text-slate-500'}`}
                        >
                            <span>{sec}</span>
                            {currentSection === sec && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-100 text-slate-900">
                    <div className="max-w-4xl mx-auto bg-white p-12 shadow-xl min-h-[800px]">
                        <h2 className="text-3xl font-serif font-bold mb-8 border-b-2 border-black pb-4">
                            {selectedExam?.sections[currentSection].title}
                        </h2>

                        <div className="prose prose-lg max-w-none font-serif leading-loose">
                            <p className="whitespace-pre-wrap">
                                {selectedExam?.sections[currentSection].content}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HallOfRecords;
