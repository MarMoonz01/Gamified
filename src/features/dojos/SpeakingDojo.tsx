import React, { useState, useEffect, useRef } from 'react';
import { useDragonStore } from '../../logic/dragonStore';
import { geminiService } from '../../logic/GeminiService';
import { motion } from 'framer-motion';
import { Mic, Volume2, AlertTriangle, RefreshCw, Play, Square } from 'lucide-react';
import { useSound } from '../../logic/soundStore';

const SpeakingDojo: React.FC = () => {
    const { playSound } = useSound();
    const { gainXp, addSummonCharge, submitExamResult } = useDragonStore();

    const [topic, setTopic] = useState("Describe a time when you helped someone.");
    const [isRecording, setIsRecording] = useState(false);
    const [silenceDuration, setSilenceDuration] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [volume, setVolume] = useState(0);

    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Audio Visualization Mock
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                // Mock volume fluctuation
                setVolume(Math.random() * 100);
            }, 100);
        } else {
            setVolume(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Silence Detector Logic
    useEffect(() => {
        if (isRecording) {
            silenceTimerRef.current = setInterval(() => {
                setSilenceDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
            setSilenceDuration(0);
        }
        return () => { if (silenceTimerRef.current) clearInterval(silenceTimerRef.current); };
    }, [isRecording]);

    // Reset silence on speech (mocked by volume > 10)
    useEffect(() => {
        if (volume > 20) setSilenceDuration(0);
    }, [volume]);

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = () => {
        setIsRecording(true);
        setTranscript('');
        setFeedback(null);
        playSound('CLICK');

        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let inter = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    inter += event.results[i][0].transcript;
                }
                setTranscript(inter);
                setSilenceDuration(0); // Reset silence on input
            };

            recognitionRef.current.start();
        } else {
            alert("Speech API not supported in this browser.");
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        if (recognitionRef.current) recognitionRef.current.stop();
        playSound('SUCCESS');

        // Analyze
        const prompt = `Act as an IELTS Examiner. Grade this Speaking Part 2 response.
        Topic: "${topic}"
        Transcript: "${transcript}"
        
        Return JSON: { score: number, feedback: "concise feedback" }`;

        try {
            const data = await geminiService.generateJSON<{ score: number, feedback: string }>(prompt);
            if (data?.score) {
                setFeedback(`Band ${data.score}: ${data.feedback}`);
                submitExamResult('SPEAKING', data.score);
                gainXp(data.score * 15);
                addSummonCharge(10);
            }
        } catch (e) {
            setFeedback("Analysis failed (AI Error).");
        }
    };

    const generateTopic = async () => {
        const prompt = "Generate an IELTS Speaking Part 2 Cue Card topic. JSON: {topic: 'Describe...'}";
        try {
            const data = await geminiService.generateJSON<{ topic: string }>(prompt);
            if (data?.topic) setTopic(data.topic);
        } catch (e) {
            setTopic("Describe a book you read recently.");
        }
    };

    return (
        <div className="w-full h-full p-8 flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 text-slate-100">
            {/* Background Echo Visuals */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className={`w-96 h-96 rounded-full border-4 border-amber-500 transition-all duration-100 transform ${isRecording ? 'scale-150 opacity-50' : 'scale-50 opacity-10'}`} style={{ transform: `scale(${1 + volume / 100})` }} />
                <div className={`w-[600px] h-[600px] rounded-full border-2 border-amber-500 absolute transition-all duration-300 transform ${isRecording ? 'scale-110' : 'scale-90'}`} style={{ transform: `scale(${1 + volume / 200})` }} />
            </div>

            <h1 className="text-4xl font-medieval text-amber-500 mb-8 relative z-10 flex items-center gap-3">
                <Mic size={40} /> The Echo Chamber
            </h1>

            {/* Topic Card */}
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 max-w-2xl w-full mb-12 text-center relative z-10">
                <h2 className="text-sm font-bold uppercase tracking-widest text-amber-500 mb-4">Current Topic</h2>
                <p className="text-2xl font-serif leading-relaxed">"{topic}"</p>
                <button onClick={generateTopic} className="absolute top-4 right-4 text-white/30 hover:text-white transition">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Visualizer & Controls */}
            <div className="flex flex-col items-center gap-8 relative z-10">
                {/* Silence Detector */}
                {silenceDuration > 3 && isRecording && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/80 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 animate-pulse"
                    >
                        <AlertTriangle size={20} /> DEAD AIR DETECTED ({silenceDuration}s)
                    </motion.div>
                )}

                <div className="flex gap-2 items-end h-16">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-4 bg-amber-500 rounded-t transition-all duration-75"
                            style={{ height: `${Math.max(10, volume * (Math.random() + 0.5))}%` }}
                        />
                    ))}
                </div>

                <button
                    onClick={toggleRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-amber-600'}`}
                >
                    {isRecording ? <Square size={32} fill="white" /> : <Mic size={40} />}
                </button>
                <div className="text-white/50 font-mono text-sm">
                    {isRecording ? "LISTENING..." : "TAP TO SPEAK"}
                </div>
            </div>

            {/* Feedback Overlay */}
            {feedback && (
                <div className="mt-8 bg-black/50 p-6 rounded border-l-4 border-amber-500 max-w-2xl w-full">
                    <h3 className="font-bold text-amber-500 mb-2">Examiner Feedback</h3>
                    <p>{feedback}</p>
                </div>
            )}

            {/* Live Transcript (Hidden or Small) */}
            {transcript && (
                <div className="mt-4 text-xs text-white/20 font-mono max-w-lg text-center truncate">
                    {transcript}
                </div>
            )}
        </div>
    );
};

export default SpeakingDojo;
