import React, { useState, useEffect } from 'react';
import { useDragonStore } from '../logic/dragonStore';
import type { DragonType } from '../logic/dragonStore';
import { geminiService } from '../logic/GeminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Skull, Scroll, Mic, PenTool, X, Flame } from 'lucide-react';
import PixelDragon from '../components/PixelDragon';
import { useSound } from '../logic/soundStore';

interface DragonEncounterProps {
    isOpen: boolean;
    onClose: () => void;
    rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
}

type BattlePhase = 'INTRO' | 'READING_SHIELD' | 'WRITING_BEAM' | 'SPEAKING_ULTI' | 'VICTORY' | 'DEFEAT';

interface BossData {
    name: string;
    title: string;
    type: DragonType;
    hp: number;
    maxHp: number;
    palette: { primary: string; secondary: string; accent: string; eye: string; };
}

const DragonEncounter: React.FC<DragonEncounterProps> = ({ isOpen, onClose, rarity }) => {
    const { receiveBossEgg, consumeSummonCharge } = useDragonStore();
    const { playSound } = useSound();

    // State
    const [phase, setPhase] = useState<BattlePhase>('INTRO');
    const [boss, setBoss] = useState<BossData | null>(null);
    const [loading, setLoading] = useState(false);
    const [challenge, setChallenge] = useState<{ text: string; question: string } | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [damageLog, setDamageLog] = useState<string[]>([]);

    // Init Boss
    useEffect(() => {
        if (isOpen && phase === 'INTRO') {
            generateBoss();
        }
    }, [isOpen]);

    const generateBoss = async () => {
        setLoading(true);
        try {
            const types: DragonType[] = ['FIRE', 'ARCANE', 'WIND', 'WATER', 'TERRA', 'RADIANT'];
            const randomType = types[Math.floor(Math.random() * types.length)];

            // AI Generates Boss Identity
            const prompt = `Generate a legendary dragon boss name and title related to 'Grammar', 'Vocabulary', or 'IELTS'. 
            e.g. "Syntaxia, the Sentence Breaker". Return JSON: {name, title}.`;

            const data = await geminiService.generateJSON<{ name: string, title: string }>(prompt);

            const hpMap = { COMMON: 100, RARE: 300, LEGENDARY: 1000 };
            const maxHp = hpMap[rarity];

            setBoss({
                name: data?.name || "The Unknown",
                title: data?.title || "Consumer of Words",
                type: randomType,
                hp: maxHp,
                maxHp: maxHp,
                palette: { primary: '#000000', secondary: '#DC2626', accent: '#D4AF37', eye: '#FF0000' } // Corrupted colors
            });
            playSound('BOSS_SPAWN');
        } catch (e) {
            console.error(e);
            onClose(); // Fail safe
        } finally {
            setLoading(false);
        }
    };

    const startPhase = async (newPhase: BattlePhase) => {
        setPhase(newPhase);
        setLoading(true);
        setFeedback(null);
        setUserAnswer('');
        setChallenge(null);
        playSound('PHASE_CHANGE');

        // --- Grimoire Injection ---
        const { vocabList } = useDragonStore.getState();
        // Pick 3 random words if available, prioritizing low mastery
        const targetWords = vocabList
            .sort((a, b) => a.mastery - b.mastery + (Math.random() - 0.5))
            .slice(0, 3)
            .map(v => v.word);

        const vocabContext = targetWords.length > 0
            ? `Connect these words if possible: ${targetWords.join(', ')}.`
            : "";
        // ---------------------------

        let prompt = "";

        switch (newPhase) {
            case 'READING_SHIELD':
                prompt = `Generate a short, complex reading passage (3 sentences, IELTS Band 9) about a fantasy history or science topic. ${vocabContext} Then ask 1 difficult reading comprehension question. JSON: {text, question}.`;
                break;
            case 'WRITING_BEAM':
                prompt = `Generate an IELTS Writing Task 2 discussion topic (short). ${vocabContext} Ask the user to write one strong argument paragraph using these words if they fit. JSON: {text: 'Topic: ...', question: 'Write a Band 8+ argument paragraph.'}.`;
                break;
            case 'SPEAKING_ULTI':
                prompt = `Generate an abstract IELTS Speaking Part 3 question. ${vocabContext} JSON: {text: 'Direct Question', question: 'Answer with high-level vocabulary.'}.`;
                break;
        }

        try {
            const data = await geminiService.generateJSON<{ text: string, question: string }>(prompt);
            setChallenge(data);
        } catch (e) {
            setFeedback("The Boss Glitched. (AI Error)");
        } finally {
            setLoading(false);
        }
    };

    const submitAttack = async () => {
        if (!userAnswer.trim()) return;
        setLoading(true);
        playSound('ATTACK_CHARGE');

        try {
            const prompt = `Evaluate this answer for IELTS Band 8 standard.
            Question: ${challenge?.question}
            Context: ${challenge?.text}
            User Answer: "${userAnswer}"
            
            Return JSON: {
                isCorrect: boolean (true if Band 7.5+ quality),
                feedback: "1 sentence critique",
                damage: number (0-100, higher for better vocabulary/grammar)
            }`;

            const result = await geminiService.generateJSON<{ isCorrect: boolean, feedback: string, damage: number }>(prompt);

            if (result?.isCorrect) {
                const dmg = result.damage || 34; // 3 hits to kill approx
                setBoss(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - dmg) } : null);
                setFeedback(`CRITICAL HIT! ${result.feedback}`);
                setDamageLog(prev => [...prev, `Dealt ${dmg} DMG: ${result.feedback}`]);
                playSound('ATTACK_HIT');

                // Next Phase Logic
                setTimeout(() => {
                    if (phase === 'READING_SHIELD') startPhase('WRITING_BEAM');
                    else if (phase === 'WRITING_BEAM') startPhase('SPEAKING_ULTI');
                    else if (phase === 'SPEAKING_ULTI') {
                        setPhase('VICTORY');
                        playSound('VICTORY');
                        consumeSummonCharge();
                        receiveBossEgg(rarity, boss?.type || 'WIND');

                        // Practice the used words in Grimoire
                        // (Ideally we would detect which specific words were used, but for now we grant mastery to the target words of this session context if we tracked them)
                        const { vocabList, practiceVocab } = useDragonStore.getState();
                        // Simple bonus: Boost all low mastery words slightly for winning
                        vocabList.filter(v => v.mastery < 3).forEach(v => practiceVocab(v.id, true));
                    }
                }, 2000);

            } else {
                setFeedback(`BLOCKED! ${result?.feedback || "Weak answer."}`);
                playSound('ATTACK_BLOCKED');
                // Maybe take damage? For now, just retry or fail?
            }

        } catch (e) {
            setFeedback("The attack fizzled... (AI Error)");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">

                {/* Boss Visual (Left) */}
                <div className="hidden lg:flex flex-col items-center justify-center w-1/3 h-full p-10 border-r border-[#D4AF37]/30 relative">
                    {boss && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={phase}
                            className="relative"
                        >
                            <div className="w-64 h-64 scale-150 relative z-10 filter drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                                <PixelDragon
                                    dna={{
                                        palette: boss.palette,
                                        headType: 'SAURIAN',
                                        tailType: 'SPIKED',
                                        wingType: 'BAT',
                                        accessories: ['HORNS']
                                    }}
                                    // stage="ADULT" // removed if not supported or check PixelDragon
                                    size={10}
                                />
                            </div>
                            <div className="flex flex-col items-center mt-6">
                                <span className={`px-2 py-1 rounded text-xs font-bold mb-2 border ${rarity === 'LEGENDARY' ? 'bg-amber-900 border-amber-500 text-amber-100' : rarity === 'RARE' ? 'bg-blue-900 border-blue-500 text-blue-100' : 'bg-slate-800 border-slate-500 text-slate-300'}`}>
                                    {rarity} BOSS
                                </span>
                                <h2 className="text-4xl font-medieval text-red-500 text-center text-shadow-lg">{boss.name}</h2>
                                <p className="text-[#D4AF37] tracking-widest text-center uppercase text-sm font-bold">{boss.title}</p>
                            </div>

                            {/* HP Bar */}
                            <div className="w-64 h-4 bg-slate-900 border border-red-900 mt-4 rounded-full overflow-hidden relative">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-600 to-red-800"
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}
                                    transition={{ type: 'spring' }}
                                />
                            </div>
                            <p className="text-center text-xs text-red-400 mt-1">{boss.hp} / {boss.maxHp} HP</p>
                        </motion.div>
                    )}
                </div>

                {/* Interaction Area (Right) */}
                <div className="flex-1 h-full max-w-3xl flex flex-col p-8 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X /></button>

                    {phase === 'INTRO' && boss && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                            <Skull size={80} className="text-red-500 mb-4 animate-pulse" />
                            <h1 className="text-5xl font-medieval text-white">BOSS ENCOUNTER</h1>
                            <p className="text-xl text-slate-300 max-w-md">
                                A <span className="text-red-400 font-bold">{boss.type}</span> dragon has corrupted the Archives.
                                Prove your mastery of the English language to purify it.
                            </p>
                            <button
                                onClick={() => startPhase('READING_SHIELD')}
                                className="px-10 py-4 bg-red-700 hover:bg-red-600 text-white font-bold text-xl rounded border-2 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-3"
                            >
                                <Sword /> BEGIN TRIAL
                            </button>
                        </div>
                    )}

                    {(phase === 'READING_SHIELD' || phase === 'WRITING_BEAM' || phase === 'SPEAKING_ULTI') && challenge && (
                        <div className="flex-1 flex flex-col gap-6">
                            {/* Phase Header */}
                            <div className="flex items-center gap-4 text-2xl font-medieval text-[#D4AF37] border-b border-[#D4AF37]/30 pb-4">
                                {phase === 'READING_SHIELD' && <><Shield className="text-blue-400" /> PHASE 1: SHIELD BREAKER</>}
                                {phase === 'WRITING_BEAM' && <><PenTool className="text-purple-400" /> PHASE 2: SYNTAX BEAM</>}
                                {phase === 'SPEAKING_ULTI' && <><Mic className="text-orange-400" /> PHASE 3: FINAL ROAR</>}
                            </div>

                            {/* Challenge Text */}
                            <div className="bg-[#FDF6E3] p-6 rounded text-[#2C1810] font-serif text-lg leading-relaxed shadow-inner border border-[#D7C4A1]">
                                {challenge.text}
                            </div>

                            {/* Question */}
                            <div className="text-white font-bold text-xl">
                                <span className="text-red-400 mr-2">BOSS:</span> "{challenge.question}"
                            </div>

                            {/* Input */}
                            <textarea
                                value={userAnswer}
                                onChange={e => setUserAnswer(e.target.value)}
                                className="w-full bg-black/50 border border-[#D4AF37] rounded p-4 text-white focus:outline-none focus:ring-2 ring-[#D4AF37] min-h-[120px] font-mono"
                                placeholder={phase === 'SPEAKING_ULTI' ? "Type your spoken response here..." : "Type your answer..."}
                            />

                            {/* Feedback */}
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded border ${feedback.includes("CRITICAL") ? "bg-green-900/50 border-green-500 text-green-200" : "bg-red-900/50 border-red-500 text-red-200"}`}
                                >
                                    {feedback}
                                </motion.div>
                            )}

                            {/* Action */}
                            <button
                                onClick={submitAttack}
                                disabled={loading}
                                className="self-end px-8 py-3 bg-[#D4AF37] text-black font-bold flex items-center gap-2 hover:bg-yellow-400 disabled:opacity-50"
                            >
                                {loading ? "CALCULATING DAMAGE..." : "CAST SPELL"} <Sword size={18} />
                            </button>
                        </div>
                    )}

                    {phase === 'VICTORY' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity }}>
                                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-200 blur-xl absolute" />
                                <Scroll size={100} className="relative z-10 text-[#2C1810]" />
                            </motion.div>

                            <h1 className="text-6xl font-medieval text-[#D4AF37] drop-shadow-md">SUBJUGATED!</h1>
                            <p className="text-xl text-slate-300">
                                You have claimed the Essence of <span className="text-white font-bold">{boss?.name}</span>.<br />
                                A <span className="text-yellow-400">{rarity} {boss?.type} EGG</span> has been added to your Hatchery.
                            </p>

                            <div className="bg-black/50 p-4 rounded text-left w-full max-w-md font-mono text-xs text-green-400">
                                {damageLog.map((log, i) => <div key={i}>&gt; {log}</div>)}
                            </div>

                            <button onClick={onClose} className="px-10 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold transition">
                                RETURN TO ACADEMY
                            </button>
                        </div>
                    )}

                    {loading && phase !== 'INTRO' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="animate-spin text-[#D4AF37]"><Flame size={48} /></div>
                        </div>
                    )}

                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DragonEncounter;
