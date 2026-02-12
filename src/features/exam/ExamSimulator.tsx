import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Clock, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// Setup PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ExamSimulatorProps {
    file: File;
    mode: 'READING' | 'LISTENING' | 'WRITING';
    onFinish: () => void;
    onBack: () => void;
}

const ExamSimulator: React.FC<ExamSimulatorProps> = ({ file, mode, onFinish, onBack }) => {
    // PDF State
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    // Timer State (60 mins default)
    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    // Answer State
    const [writingText, setWritingText] = useState("");
    const [mcqAnswers, setMcqAnswers] = useState<string[]>(Array(40).fill(""));

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            alert("Time's up! Pens down.");
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const wordCount = writingText.trim().split(/\s+/).filter(w => w.length > 0).length;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-900 z-[200] flex flex-col"
        >
            {/* Toolbar */}
            <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2">
                        <ArrowLeft size={20} /> Exit
                    </button>
                    <h2 className="text-white font-bold text-lg">{mode} Exam Simulator</h2>
                </div>

                <div className="flex items-center gap-6">
                    {/* PDF Controls */}
                    <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                            disabled={pageNumber <= 1}
                            className="p-2 hover:bg-slate-600 rounded text-slate-300 disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-xs text-slate-300 w-20 text-center">
                            Page {pageNumber} / {numPages || '--'}
                        </span>
                        <button
                            onClick={() => setPageNumber(prev => Math.min(numPages || 1, prev + 1))}
                            disabled={pageNumber >= (numPages || 1)}
                            className="p-2 hover:bg-slate-600 rounded text-slate-300 disabled:opacity-50"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <div className="w-px h-6 bg-slate-600 mx-1" />
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-slate-600 rounded text-slate-300"><ZoomOut size={18} /></button>
                        <span className="text-xs text-slate-300 w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-2 hover:bg-slate-600 rounded text-slate-300"><ZoomIn size={18} /></button>
                    </div>

                    <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                        <Clock size={24} />
                        {formatTime(timeLeft)}
                    </div>

                    <button
                        onClick={onFinish}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <Save size={18} /> Submit
                    </button>
                </div>
            </div>

            {/* Split Screen */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: PDF Viewer */}
                <div className="w-1/2 bg-slate-200 overflow-auto flex justify-center p-8 border-r border-slate-700">
                    <div className="shadow-2xl">
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="flex flex-col gap-4"
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="mb-4 shadow-md"
                            />
                        </Document>
                    </div>
                </div>

                {/* Right: Answer Sheet */}
                <div className="w-1/2 bg-slate-50 flex flex-col h-full">
                    <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            Answer Sheet
                        </h3>
                        {mode === 'WRITING' && (
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                Words: {wordCount}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {mode === 'WRITING' ? (
                            <textarea
                                value={writingText}
                                onChange={(e) => setWritingText(e.target.value)}
                                placeholder="Start writing your essay here..."
                                className="w-full h-full min-h-[500px] p-6 bg-white border border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif text-lg leading-relaxed text-slate-800 resize-none"
                            />
                        ) : (
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {Array.from({ length: 40 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <label className="w-8 text-right font-bold text-slate-400">{i + 1}.</label>
                                        <input
                                            type="text"
                                            value={mcqAnswers[i]}
                                            onChange={(e) => {
                                                const newAns = [...mcqAnswers];
                                                newAns[i] = e.target.value;
                                                setMcqAnswers(newAns);
                                            }}
                                            className="flex-1 p-2 border border-slate-300 rounded focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ExamSimulator;
