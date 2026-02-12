import React, { useState } from 'react';
import { Play, Pause, FastForward, Rewind, FileText, ArrowLeft, Headphones } from 'lucide-react';

interface ListeningDojoProps {
    onBack: () => void;
}

const ListeningDojo: React.FC<ListeningDojoProps> = ({ onBack }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1.0);
    const [notes, setNotes] = useState('');

    // Mock Audio Time
    const [currentTime] = useState(0);
    const duration = 1800; // 30 mins

    const togglePlay = () => setIsPlaying(!isPlaying);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')} `;
    };

    return (
        <div className="w-full h-full p-8 max-w-5xl mx-auto flex flex-col gap-6">
            <h1 className="text-3xl font-medieval text-fantasy-wood-dark flex items-center gap-3">
                Listening Dojo: The Lake
            </h1>

            {/* Audio Player Card */}
            <div className="bg-sky-900 text-white p-6 rounded-xl shadow-lg border border-sky-400/30">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-indigo-500/30 pb-4">
                    <h1 className="text-3xl font-bold text-indigo-100 flex items-center gap-3 font-mono">
                        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-indigo-400">
                            <ArrowLeft size={24} />
                        </button>
                        <Headphones size={32} className="text-indigo-400" />
                        SIGNAL INTERCEPTOR
                    </h1>    <div className="bg-black/30 px-3 py-1 rounded text-xs font-mono">
                        {speed}x Speed
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-sky-950 rounded-full mb-6 relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 left-0 h-full bg-sky-400 w-1/3" />
                </div>

                <div className="flex justify-center items-center gap-8">
                    <button className="text-sky-300 hover:text-white transition"><Rewind size={24} /></button>
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-sky-400 text-sky-900 rounded-full flex items-center justify-center hover:bg-white hover:scale-105 transition shadow-lg"
                    >
                        {isPlaying ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
                    </button>
                    <button className="text-sky-300 hover:text-white transition"><FastForward size={24} /></button>
                </div>

                <div className="flex justify-between mt-4 text-xs font-mono text-sky-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={() => setSpeed(1.0)} className={`px - 3 py - 1 rounded border border - sky - 500 / 50 ${speed === 1.0 ? 'bg-sky-500 text-white' : 'text-sky-300 hover:bg-sky-800'} `}>1.0x</button>
                    <button onClick={() => setSpeed(1.25)} className={`px - 3 py - 1 rounded border border - sky - 500 / 50 ${speed === 1.25 ? 'bg-sky-500 text-white' : 'text-sky-300 hover:bg-sky-800'} `}>1.25x</button>
                    <button onClick={() => setSpeed(1.5)} className={`px - 3 py - 1 rounded border border - sky - 500 / 50 ${speed === 1.5 ? 'bg-sky-500 text-white' : 'text-sky-300 hover:bg-sky-800'} `}>1.5x</button>
                </div>
            </div>

            {/* Note Taking Area */}
            <div className="flex-1 bg-fantasy-paper p-6 rounded-lg border-2 border-fantasy-wood/20 relative shadow-inner flex flex-col">
                <div className="absolute top-0 left-0 w-full h-8 bg-fantasy-wood/10 border-b border-fantasy-wood/10 flex items-center px-4 gap-2 text-fantasy-wood/60 text-xs font-bold uppercase">
                    <FileText size={14} /> Quick Notes
                </div>
                <textarea
                    className="flex-1 bg-transparent border-none outline-none font-mono text-sm leading-relaxed text-fantasy-wood-dark pt-8 resize-none placeholder:text-fantasy-wood/30"
                    placeholder="Type your notes here while listening..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
            </div>
        </div>
    );
};

export default ListeningDojo;
