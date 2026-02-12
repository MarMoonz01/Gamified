import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mic, PenTool, Headphones, Shield, Flame, Wind, Droplets } from 'lucide-react';
import Parchment from '../components/ui/Parchment';

const Academy: React.FC = () => {
    const navigate = useNavigate();

    const dojos = [
        {
            id: 'writing',
            title: 'The Forge',
            subtitle: 'Writing Dojo',
            icon: PenTool,
            elementIcon: Flame,
            color: 'red',
            desc: "Temper your arguments in the fires of logic. (Writing Task 1 & 2)",
            path: '/dojo/writing'
        },
        {
            id: 'speaking',
            title: 'Echo Chamber',
            subtitle: 'Speaking Dojo',
            icon: Mic,
            elementIcon: Wind,
            color: 'amber',
            desc: "Find your voice amidst the silence. (Speaking Part 1, 2, 3)",
            path: '/dojo/speaking'
        },
        {
            id: 'reading',
            title: 'The Archive',
            subtitle: 'Reading Dojo',
            icon: BookOpen,
            elementIcon: Shield,
            color: 'blue',
            desc: "Decipher the ancient scrolls with precision. (Reading Comprehension)",
            path: '/dojo/reading'
        },
        {
            id: 'listening',
            title: 'The Lake',
            subtitle: 'Listening Dojo',
            icon: Headphones,
            elementIcon: Droplets,
            color: 'cyan',
            desc: "Listen to the whispers of the world. (Listening Practice)",
            path: '/dojo/listening'
        }
    ];

    return (
        <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar">
            <header className="mb-10 text-center">
                <h1 className="text-5xl font-medieval text-fantasy-gold mb-2 drop-shadow-md">Dragon Academy</h1>
                <p className="text-fantasy-paper/60 italic font-serif text-lg">"Master the four elements of communication."</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {dojos.map((dojo, i) => (
                    <motion.div
                        key={dojo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(dojo.path)}
                        className={`group relative cursor-pointer perspective`}
                    >
                        <div className={`absolute inset-0 bg-${dojo.color}-500/10 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                        <Parchment className="h-full relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] border-2 border-transparent group-hover:border-fantasy-gold/30">
                            {/* Background Element */}
                            <div className={`absolute -right-10 -bottom-10 opacity-5 text-${dojo.color}-900`}>
                                <dojo.elementIcon size={200} />
                            </div>

                            <div className="relative z-10 flex gap-6 items-start">
                                <div className={`p-4 rounded-xl bg-${dojo.color}-900/10 text-${dojo.color}-700 border border-${dojo.color}-900/20 group-hover:bg-${dojo.color}-900/20 transition-colors`}>
                                    <dojo.icon size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-medieval text-fantasy-wood-dark group-hover:text-fantasy-gold transition-colors">
                                        {dojo.title}
                                    </h2>
                                    <div className="text-xs font-bold uppercase tracking-widest text-fantasy-wood/50 mb-2">
                                        {dojo.subtitle}
                                    </div>
                                    <p className="text-fantasy-wood/80 font-serif leading-relaxed">
                                        {dojo.desc}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <span className="text-xs font-mono text-fantasy-wood/40 group-hover:text-fantasy-gold transition-colors">
                                    ENTER DOJO &rarr;
                                </span>
                            </div>
                        </Parchment>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={() => navigate('/hall-of-records')}
                    className="px-8 py-3 bg-red-900/80 text-red-100 font-medieval text-xl rounded border border-red-500/30 hover:bg-red-800 transition shadow-lg flex items-center gap-3 mx-auto"
                >
                    <Shield size={20} /> ENTER HALL OF RECORDS
                </button>
                <p className="text-xs text-red-900/40 mt-2 font-mono uppercase tracking-widest">
                    Warning: Full Simulation Mode
                </p>
            </div>
        </div>
    );
};

export default Academy;
