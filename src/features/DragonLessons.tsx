import React, { useState } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, Mic, Headphones, Brain, Trophy, Star, ChevronRight, Lock } from 'lucide-react';
import WritingDojo from './dojos/WritingDojo';
import SpeakingDojo from './dojos/SpeakingDojo';
import ReadingDojo from './dojos/ReadingDojo';
import ListeningDojo from './dojos/ListeningDojo';

type LessonMode = 'VOCAB' | 'GRAMMAR' | 'WRITING' | 'SPEAKING' | 'READING' | 'LISTENING' | null;

import { useNavigate } from 'react-router-dom';

const DragonLessons: React.FC = () => {
    useDragonStore();
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState<LessonMode>(null);

    // Menu Item Component
    const MenuItem = ({ mode, title, icon: Icon, color, desc, locked, path }: any) => (
        <motion.button
            whileHover={!locked ? { scale: 1.02, x: 5 } : {}}
            whileTap={!locked ? { scale: 0.98 } : {}}
            onClick={() => {
                if (locked) return;
                if (path) {
                    navigate(path);
                } else {
                    setSelectedMode(mode);
                }
            }}
            className={`w-full p-6 text-left rounded-xl border-2 transition-all group relative overflow-hidden ${locked
                ? 'bg-slate-100 border-slate-200 opacity-70 cursor-not-allowed grayscale'
                : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md'
                }`}
        >
            <div className="flex items-center gap-6 relative z-10">
                <div className={`p-4 rounded-full ${locked ? 'bg-slate-200 text-slate-400' : `bg-${color}-100 text-${color}-600`}`}>
                    <Icon size={32} />
                </div>
                <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 ${locked ? 'text-slate-500' : 'text-slate-800'}`}>{title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{desc}</p>
                </div>
                {locked ? <Lock className="text-slate-300" /> : <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />}
            </div>
        </motion.button>
    );

    // Render Active Dojo
    if (selectedMode) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full bg-slate-50 relative"
            >
                {selectedMode === 'WRITING' && <WritingDojo onBack={() => setSelectedMode(null)} />}
                {selectedMode === 'SPEAKING' && <SpeakingDojo onBack={() => setSelectedMode(null)} />}
                {selectedMode === 'READING' && <ReadingDojo onBack={() => setSelectedMode(null)} />}
                {selectedMode === 'LISTENING' && <ListeningDojo onBack={() => setSelectedMode(null)} />}

                {/* Fallback for legacy/unimplemented modes */}
                {(selectedMode === 'VOCAB' || selectedMode === 'GRAMMAR') && (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Module Under Construction</h2>
                        <button
                            onClick={() => setSelectedMode(null)}
                            className="px-4 py-2 bg-slate-800 text-white rounded"
                        >
                            Return
                        </button>
                    </div>
                )}
            </motion.div>
        );
    }

    // Main Menu
    return (
        <div className="w-full h-full p-8 overflow-y-auto bg-slate-50/50">
            <header className="mb-12 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                    <Brain size={16} /> Dragon Academy
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Choose Your Path
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                    Master the four pillars of communication to strengthen your bond with the summons.
                    Each session grants XP and Summon Charges.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto pb-12">
                {/* Hall of Records (New) */}
                <MenuItem
                    title="The Hall of Records"
                    icon={Trophy}
                    color="slate"
                    desc="Full Mock Exams and Past Simulations."
                    path="/hall-of-records"
                />

                <MenuItem
                    mode="WRITING"
                    title="The Iron Forge"
                    icon={PenTool}
                    color="red"
                    desc="Construct powerful essays and refine your arguments."
                />
                <MenuItem
                    mode="SPEAKING"
                    title="The Echo Chamber"
                    icon={Mic}
                    color="amber"
                    desc="Practice fluency and pronunciation with real-time feedback."
                />
                <MenuItem
                    mode="READING"
                    title="The Grand Library"
                    icon={BookOpen}
                    color="emerald"
                    desc="Analyze texts and uncover hidden meanings."
                />
                <MenuItem
                    mode="LISTENING"
                    title="Signal Interceptor"
                    icon={Headphones}
                    color="indigo"
                    desc="Tune your ears to catch every detail."
                />

                {/* Legacy/Bonus Modes - Locked for now or optional */}
                <MenuItem
                    mode="VOCAB"
                    title="Lexicon Expansion"
                    icon={Star}
                    color="purple"
                    desc="Enhance your vocabulary arsenal."
                    locked={true}
                />
            </div>
        </div>
    );
};

export default DragonLessons;
