import React, { useState, useEffect, useRef } from 'react';
import { useDragonStore } from '../../logic/dragonStore';
import { geminiService } from '../../logic/GeminiService';
import { Mic, Square, User } from 'lucide-react';
import { useSound } from '../../logic/soundStore';
import { ArrowLeft } from 'lucide-react';

interface SpeakingDojoProps {
    onBack: () => void;
}

type ExamStage = 'INTRO' | 'PART1' | 'PART2_PREP' | 'PART2_SPEAK' | 'PART3' | 'FEEDBACK';

const SpeakingDojo: React.FC<SpeakingDojoProps> = ({ onBack }) => {
    const { playSound } = useSound();
    const { gainXp, submitExamResult } = useDragonStore();

    // Exam State
    const [stage, setStage] = useState<ExamStage>('INTRO');
    const [examinerText, setExaminerText] = useState("Good afternoon. I am your examiner today. Can you tell me your full name?");
    const [cueCardTopic, setCueCardTopic] = useState("");

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [fullTranscript, setFullTranscript] = useState<{ role: 'EXAMINER' | 'CANDIDATE', text: string }[]>([]);

    // Timer & Utils
    const [timeLeft, setTimeLeft] = useState(0);
    const [volume, setVolume] = useState(0);
    const recognitionRef = useRef<any>(null);
    // const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Initial Start
    useEffect(() => {
        speak(examinerText);
        setFullTranscript([{ role: 'EXAMINER', text: examinerText }]);
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && stage === 'PART2_PREP') {
            startPart2Speaking();
        } else if (timeLeft === 0 && stage === 'PART2_SPEAK' && isRecording) {
            stopRecording(); // Auto stop after 2 mins
        }
        return () => clearInterval(interval);
    }, [timeLeft, stage, isRecording]);

    // Audio Vis
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRecording) {
            interval = setInterval(() => setVolume(Math.random() * 100), 100);
        } else {
            setVolume(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.0;
        u.pitch = 0.9;
        window.speechSynthesis.speak(u);
    };

    const startRecording = () => {
        setIsRecording(true);
        setTranscript('');
        playSound('CLICK');

        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            recognitionRef.current.start();
        } else {
            alert("Speech API not supported.");
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        if (recognitionRef.current) recognitionRef.current.stop();
        playSound('SUCCESS');

        const newHistory = [...fullTranscript, { role: 'CANDIDATE' as const, text: transcript || "(No answer provided)" }];
        setFullTranscript(newHistory);
        await processStageTransition(newHistory);
    };

    const processStageTransition = async (history: { role: string, text: string }[]) => {
        // AI Logic to determine next question/stage
        const lastCandidateResponse = history[history.length - 1].text;
        let nextResponse = "";

        if (stage === 'INTRO') {
            setStage('PART1');
            nextResponse = "Thank you. Now, let's talk about where you live. Do you live in a house or an apartment?";
        } else if (stage === 'PART1') {
            // Simple mock count check or randomized AI response
            if (history.filter(h => h.role === 'CANDIDATE').length < 4) {
                // Ask another P1 question
                const prompt = `IELTS Examiner Part 1. Previous: "${lastCandidateResponse}". Ask a follow-up or new P1 question about Hobbies/Work/Home. Keep it short.`;
                const data = await geminiService.generateJSON<{ question: string }>(`${prompt} JSON: {question: "..."}`);
                nextResponse = data?.question || "What is your favorite room in your home?";
            } else {
                setStage('PART2_PREP');
                const prompt = "Generate an IELTS Part 2 Cue Card Topic about Travel or Memories.";
                const data = await geminiService.generateJSON<{ topic: string }>(`${prompt} JSON: {topic: "..."}`);
                const topic = data?.topic || "Describe a memorable journey you took.";
                setCueCardTopic(topic);
                nextResponse = `Moving on to Part 2. I'm going to give you a topic, and I'd like you to talk about it for one to two minutes. You have one minute to think about what you are going to say. Here is your topic: ${topic}. Your time starts now.`;
                setTimeLeft(60);
            }
        } else if (stage === 'PART2_SPEAK') { // Transition to P3
            setStage('PART3');
            nextResponse = "Thank you. We have been talking about a journey you took. Now I'd like to discuss some more general questions related to this. Do you think travel is important for education?";
        } else if (stage === 'PART3') {
            if (history.filter(h => h.role === 'CANDIDATE').length < 6) {
                const prompt = `IELTS Examiner Part 3. Context: Travel/Education. Previous: "${lastCandidateResponse}". Ask a complex, abstract follow-up question.`;
                const data = await geminiService.generateJSON<{ question: string }>(`${prompt} JSON: {question: "..."}`);
                nextResponse = data?.question || "How has tourism changed in your country recently?";
            } else {
                setStage('FEEDBACK');
                nextResponse = "That is the end of the speaking test. Thank you.";
                generateFeedback(history);
            }
        }

        if (nextResponse) {
            setExaminerText(nextResponse);
            setFullTranscript(prev => [...prev, { role: 'EXAMINER', text: nextResponse }]);
            speak(nextResponse);
        }
    };

    const startPart2Speaking = () => {
        setStage('PART2_SPEAK');
        const msg = "Alright, remember you have one to two minutes for this. Don't worry if I stop you. I'll tell you when the time is up. Can you start speaking now, please?";
        setExaminerText(msg);
        setFullTranscript(prev => [...prev, { role: 'EXAMINER', text: msg }]);
        speak(msg);
        setTimeLeft(120); // 2 mins
    };

    const generateFeedback = async (history: any[]) => {
        const conversation = history.map(h => `${h.role}: ${h.text}`).join('\n');
        const prompt = `Act as an IELTS Examiner. Grade this full Speaking Test.
        Conversation:
        ${conversation}
        
        Return JSON: { score: number, feedback: "concise feedback on 4 criteria", strengths: [], weaknesses: [] }`;

        try {
            const data = await geminiService.generateJSON<{ score: number, feedback: string, strengths: string[], weaknesses: string[] }>(prompt);
            if (data?.score) {
                setExaminerText(`Band Score: ${data.score}. ${data.feedback}`);
                submitExamResult('SPEAKING', data.score);
                gainXp(data.score * 30);
            }
        } catch (e) {
            setExaminerText("Analysis failed.");
        }
    };

    return (
        <div className="w-full h-full p-8 flex flex-col relative overflow-hidden bg-slate-900 text-slate-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-amber-500">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-medieval text-amber-500 flex items-center gap-2">
                        <Mic size={24} /> The Echo Chamber
                    </h1>
                    <span className="text-xs font-mono text-slate-400">AI EXAMINER SIMULATION</span>
                </div>
                <div className={`px-4 py-2 rounded font-mono font-bold ${isRecording ? 'bg-red-900 text-red-100 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    {isRecording ? 'ON AIR' : 'WAITING'}
                </div>
            </div>

            {/* Main Stage Area */}
            <div className="flex-1 flex gap-6 relative z-10">
                {/* Left: Examiner Avatar & Visuals */}
                <div className="w-1/3 flex flex-col items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-b from-amber-700 to-amber-900 mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden">
                        <User size={64} className="text-amber-100 z-10" />
                        {/* Audio Waveform Effect */}
                        {isRecording && (
                            <div className="absolute inset-x-0 bottom-0 h-1/2 flex items-end justify-center gap-1 opacity-50">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-2 bg-amber-200 rounded-t transition-all duration-75 ease-in-out"
                                        style={{ height: `${Math.max(10, volume * (Math.random() + 0.2))}%` }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-center space-y-4">
                        <h2 className="text-xl font-bold text-amber-500">Elder Ignis</h2>
                        <div className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 min-h-[100px] flex items-center justify-center italic">
                            "{examinerText}"
                        </div>
                        {timeLeft > 0 && <div className="text-4xl font-mono text-amber-500 animate-pulse">{timeLeft}s</div>}
                    </div>
                </div>

                {/* Right: Interaction Area */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Transcript / Cue Card */}
                    <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700 p-6 overflow-y-auto relative">
                        {stage === 'PART2_PREP' || stage === 'PART2_SPEAK' ? (
                            <div className="bg-amber-100 text-slate-900 p-6 rounded shadow-lg rotate-1 max-w-md mx-auto mt-10">
                                <h3 className="font-bold uppercase tracking-widest text-xs text-amber-800 mb-2">Cue Card</h3>
                                <p className="font-serif text-lg leading-relaxed">{cueCardTopic}</p>
                                <ul className="list-disc pl-5 mt-4 text-sm font-serif text-amber-900">
                                    <li>You should say:</li>
                                    <li>What it was</li>
                                    <li>When you did it</li>
                                    <li>Who you were with</li>
                                    <li>And explain why it was memorable</li>
                                </ul>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {fullTranscript.map((t, i) => (
                                    <div key={i} className={`flex gap-3 ${t.role === 'EXAMINER' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${t.role === 'EXAMINER' ? 'bg-slate-800 text-amber-500' : 'bg-amber-900/40 text-slate-200'}`}>
                                            {t.text}
                                        </div>
                                    </div>
                                ))}
                                {transcript && (
                                    <div className="flex gap-3 justify-end">
                                        <div className="max-w-[80%] p-3 rounded-lg text-sm bg-amber-900/20 text-slate-400 italic border border-amber-500/30">
                                            {transcript}...
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-center gap-6">
                        {stage !== 'FEEDBACK' && (
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 ${isRecording ? 'bg-red-600' : 'bg-amber-600'}`}
                            >
                                {isRecording ? <Square size={24} fill="white" /> : <Mic size={32} />}
                            </button>
                        )}
                        {stage === 'PART2_PREP' && (
                            <button
                                onClick={startPart2Speaking}
                                className="px-6 py-3 bg-amber-600 rounded font-bold hover:bg-amber-500"
                            >
                                Start Speaking Now
                            </button>
                        )}
                        {stage === 'FEEDBACK' && (
                            <button onClick={onBack} className="px-6 py-3 bg-slate-700 rounded font-bold hover:bg-slate-600">
                                Exit Dojo
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeakingDojo;
