import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDragonStore } from '../logic/dragonStore';
import { User, Sword, Heart, Zap, Brain, Eye, Trophy, Target, Edit2, Check, X, Star, Crown, Hash } from 'lucide-react';
import { useSound } from '../logic/soundStore';

const Profile: React.FC = () => {
    const { dragons, essence, gold, activityLog, playerName, setPlayerName } = useDragonStore();
    const { playSound } = useSound();

    // Name Editing State
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(playerName || "Dragon Keeper");

    useEffect(() => {
        if (!playerName) setPlayerName("Dragon Keeper");
    }, [playerName, setPlayerName]);

    const handleSaveName = () => {
        if (tempName.trim()) {
            setPlayerName(tempName);
            playSound('SUCCESS');
            setIsEditingName(false);
        }
    };

    // --- Calculate RPG Stats from Activity Log ---
    const calculateStat = (sources: string[]) => {
        return activityLog
            .filter(log => sources.some(s => log.source.includes(s)))
            .reduce((acc, log) => acc + log.amount, 0);
    };

    // Mapping Activities to Stats
    const strength = calculateStat(['HEALTH', 'WORKOUT', 'TERRA_HEALTH']);
    const intelligence = calculateStat(['STUDY', 'READING', 'IELTS_READING', 'IELTS_WRITING', 'ARCANE_STUDY', 'FIRE_STUDY']);
    const vitality = calculateStat(['HEALTH', 'MEDITATION', 'SLEEP', 'TERRA_HEALTH']);
    const agility = calculateStat(['LISTENING', 'IELTS_LISTENING', 'WATER_SOCIAL']);
    const charisma = calculateStat(['SPEAKING', 'IELTS_SPEAKING', 'SOCIAL', 'RADIANT_SOCIAL']);

    // Derived Levels (Base 100 XP per level curve approx)
    const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 10)) + 1;

    const stats = {
        strength: getLevel(strength),
        intelligence: getLevel(intelligence),
        vitality: getLevel(vitality),
        agility: getLevel(agility),
        charisma: getLevel(charisma)
    };

    const totalLevel = Object.values(stats).reduce((a, b) => a + b, 0);
    const rank = totalLevel > 100 ? 'SSR-RANK' : totalLevel > 50 ? 'S-RANK' : totalLevel > 30 ? 'A-RANK' : totalLevel > 10 ? 'B-RANK' : 'E-RANK';

    // Title Logic
    let title = "Novice Tamer";
    const maxStat = Math.max(...Object.values(stats));
    if (maxStat > 10) {
        if (stats.intelligence === maxStat) title = "Grand Scholar";
        else if (stats.strength === maxStat) title = "Beastmaster";
        else if (stats.charisma === maxStat) title = "Radiant Idol";
        else if (stats.vitality === maxStat) title = "Immortal Guardian";
        else if (stats.agility === maxStat) title = "Wind Walker";
    }
    if (dragons.length >= 5) title = "Dragon Lord";

    const StatRow = ({ label, value, icon: Icon, color, details }: { label: string, value: number, icon: any, color: string, details: string }) => (
        <div className="flex items-center gap-4 py-3 border-b border-amber-900/10 last:border-0 group hover:bg-amber-900/5 transition px-2 rounded">
            <div className={`p-2 rounded bg-amber-100 border border-${color}-600/30 text-${color}-700`}>
                <Icon size={18} />
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medieval text-amber-900/70 tracking-wider text-sm">{label}</span>
                    <span className="font-mono text-amber-900 text-lg font-bold">Nv. {value}</span>
                </div>
                <div className="h-1.5 bg-amber-900/10 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full bg-${color}-600`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (value / 50) * 100)}%` }} // Visual cap
                    />
                </div>
                <div className="text-[10px] text-amber-800/60 mt-1 font-mono hidden group-hover:block transition-all">
                    {details}
                </div>
            </div>
        </div>
    );

    const Badge = ({ icon: Icon, label, unlocked, color }: { icon: any, label: string, unlocked: boolean, color: string }) => (
        <div className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 p-2 transition-all ${unlocked ? `bg-${color}-50 border-${color}-400 text-${color}-800 shadow-sm` : 'bg-slate-100 border-slate-200 text-slate-300 grayscale'}`}>
            <Icon size={20} />
            <span className="text-[9px] font-bold text-center leading-tight uppercase tracking-wide">{label}</span>
        </div>
    );

    return (
        <div className="h-full w-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">

                {/* Left Column: Hunter Card */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Hunter License Card */}
                    <div className="relative group perspective-1000">
                        <motion.div
                            initial={{ rotateY: 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="bg-gradient-to-br from-[#1a1a1a] to-[#2C1810] rounded-xl overflow-hidden shadow-2xl border-2 border-[#D4AF37] relative"
                        >
                            {/* Holographic Overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-amber-500/10" />

                            <div className="p-6 relative z-10 text-center text-[#D4AF37]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-xs font-mono opacity-60">HUNTER LICENSE</div>
                                    <Crown size={18} className="text-[#D4AF37]" />
                                </div>

                                <div className="w-32 h-32 mx-auto rounded-full border-4 border-[#D4AF37] bg-black/50 flex items-center justify-center mb-4 shadow-[0_0_20px_#D4AF3777] overflow-hidden">
                                    {dragons.length > 0 ? (
                                        <div className="text-4xl">🐉</div> // Placeholder for Avatar
                                    ) : (
                                        <User size={64} className="text-[#D4AF37]/50" />
                                    )}
                                </div>

                                {/* Name Editing */}
                                {isEditingName ? (
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <input
                                            autoFocus
                                            className="bg-black/40 border-b border-[#D4AF37] text-center font-medieval text-xl text-white outline-none w-40"
                                            value={tempName}
                                            onChange={e => setTempName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                        />
                                        <button onClick={handleSaveName} className="text-green-400"><Check size={16} /></button>
                                        <button onClick={() => setIsEditingName(false)} className="text-red-400"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <h2 className="text-2xl font-medieval tracking-widest text-white mb-1 flex items-center justify-center gap-2 group-hover:text-[#FDF6E3] transition">
                                        {playerName || "Dragon Keeper"}
                                        <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition text-[#D4AF37]/50 hover:text-[#D4AF37]"><Edit2 size={14} /></button>
                                    </h2>
                                )}

                                <div className="text-xs font-mono font-bold text-[#D4AF37] tracking-[0.3em] uppercase mb-6">{title}</div>

                                <div className="grid grid-cols-2 gap-2 text-left bg-black/30 p-3 rounded-lg border border-[#D4AF37]/30">
                                    <div>
                                        <div className="text-[9px] text-amber-500/60 uppercase">Rank</div>
                                        <div className="font-medieval text-lg text-white">{rank}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-amber-500/60 uppercase">Total Level</div>
                                        <div className="font-mono text-lg text-white">{totalLevel}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-amber-500/60 uppercase">Dragons</div>
                                        <div className="font-mono text-lg text-blue-300">{dragons.length}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-amber-500/60 uppercase">Essence</div>
                                        <div className="font-mono text-lg text-purple-300">{essence}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Barcode visual */}
                            <div className="h-4 bg-black flex items-center justify-center gap-1 opacity-50 mt-2">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className={`h-full w-${Math.random() > 0.5 ? '1' : '0.5'} bg-[#D4AF37]`} />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Collection Preview */}
                    <div className="glass-panel p-6">
                        <h3 className="system-header mb-4 flex items-center gap-2">
                            <Trophy size={16} /> DRAGON SOULS
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {dragons.map((dragon, i) => (
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    key={i}
                                    className="aspect-square bg-amber-50/50 border border-amber-900/10 rounded-lg flex items-center justify-center text-xl shadow-inner cursor-help"
                                    title={`${dragon.name} (${dragon.type})`}
                                >
                                    {dragon.type === 'FIRE' ? '🔥' :
                                        dragon.type === 'WATER' ? '💧' :
                                            dragon.type === 'WIND' ? '🌪️' :
                                                dragon.type === 'TERRA' ? '🌿' :
                                                    dragon.type === 'RADIANT' ? '✨' : '🔮'}
                                </motion.div>
                            ))}
                            {/* Empty Slots */}
                            {Array.from({ length: Math.max(0, 10 - dragons.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square bg-black/5 border border-black/5 rounded-lg flex items-center justify-center text-black/10 font-medieval">
                                    ?
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Abilities */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stats Panel */}
                    <div className="glass-panel p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Target size={120} className="text-amber-900" />
                        </div>

                        <div className="flex justify-between items-center mb-6 border-b border-amber-900/10 pb-4 relative z-10">
                            <h3 className="system-header mb-0 border-0 pb-0 flex items-center gap-2">
                                <Target size={16} /> ATTRIBUTE MATRIX
                            </h3>
                            <div className="text-xs text-amber-800/60 italic font-mono">
                                Growth tracking online
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-1">
                                <StatRow
                                    label="INTELLIGENCE"
                                    value={stats.intelligence}
                                    icon={Brain}
                                    color="blue"
                                    details="Study, Reading, IELTS"
                                />
                                <StatRow
                                    label="CHARISMA"
                                    value={stats.charisma}
                                    icon={Eye}
                                    color="purple"
                                    details="Speaking, Social"
                                />
                                <StatRow
                                    label="AGILITY"
                                    value={stats.agility}
                                    icon={Zap}
                                    color="yellow"
                                    details="Listening, Quick Tasks"
                                />
                            </div>
                            <div className="space-y-1">
                                <StatRow
                                    label="VITALITY"
                                    value={stats.vitality}
                                    icon={Heart}
                                    color="green"
                                    details="Health, Sleep, Meditation"
                                />
                                <StatRow
                                    label="STRENGTH"
                                    value={stats.strength}
                                    icon={Sword}
                                    color="red"
                                    details="Workouts, Discipline"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Badges & Milestones */}
                    <div className="glass-panel p-6">
                        <h3 className="system-header mb-4 flex items-center gap-2">
                            <Star size={16} /> MILESTONES
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            <Badge icon={Brain} label="Scholar" unlocked={stats.intelligence >= 10} color="blue" />
                            <Badge icon={Sword} label="Warrior" unlocked={stats.strength >= 10} color="red" />
                            <Badge icon={Crown} label="King" unlocked={dragons.length >= 5} color="amber" />
                            <Badge icon={Hash} label="Rich" unlocked={gold >= 1000} color="yellow" />
                            <Badge icon={Check} label="Doer" unlocked={activityLog.length >= 50} color="green" />
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="glass-panel p-6">
                        <h3 className="system-header mb-4">RECENT ACTIVITY</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto px-1 custom-scrollbar">
                            {activityLog.slice().reverse().slice(0, 8).map((log, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/50 border border-amber-900/5 hover:bg-white transition shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        <span className="text-sm text-amber-900 font-bold">{log.source}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-amber-800/60 font-mono">{log.date}</span>
                                        <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded text-xs">+{log.amount} XP</span>
                                    </div>
                                </div>
                            ))}
                            {activityLog.length === 0 && (
                                <div className="text-center text-amber-800/40 italic py-8 font-medieval">No activity recorded yet. Start your journey!</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
