import React, { useEffect } from 'react';
import { useDragonStore, type Achievement } from '../logic/dragonStore';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Flame, Egg, BookOpen, Coins, PawPrint } from 'lucide-react';
import clsx from 'clsx';

const iconMap: Record<string, any> = {
    'Trophy': Trophy,
    'Flame': Flame,
    'Egg': Egg,
    'BookOpen': BookOpen,
    'Coins': Coins,
    'PawPrint': PawPrint
};

const Achievements: React.FC = () => {
    const { achievements, checkAchievements } = useDragonStore();

    // Check on mount
    useEffect(() => {
        checkAchievements();
    }, []);

    const unlockedCount = achievements.filter(a => a.unlockedAt).length;
    const progress = (unlockedCount / achievements.length) * 100;

    return (
        <div className="p-6 h-full overflow-y-auto bg-[#F0F4F8] font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="text-[#D4AF37]" />
                    Book of Deeds
                </h1>
                <p className="text-slate-500 mt-1">Track your triumphs and claim your rewards.</p>

                {/* Progress Bar */}
                <div className="mt-4 w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-[#4A7C59] h-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="text-right text-xs font-bold text-slate-500 mt-1">
                    {unlockedCount} / {achievements.length} Unlocked
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(achievement => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
            </div>
        </div>
    );
};

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const isUnlocked = !!achievement.unlockedAt;
    const Icon = iconMap[achievement.icon] || Star;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "relative p-4 rounded-xl border-2 flex items-center gap-4 transition-all overflow-hidden",
                isUnlocked
                    ? "bg-white border-[#D4AF37] shadow-md"
                    : "bg-slate-100 border-slate-200 opacity-70 grayscale"
            )}
        >
            {/* Background Shine for Unlocked */}
            {isUnlocked && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl -z-0 translate-x-10 -translate-y-10 opacity-50" />
            )}

            <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10",
                isUnlocked ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-slate-200 text-slate-400"
            )}>
                {isUnlocked ? <Icon size={24} /> : <Lock size={20} />}
            </div>

            <div className="z-10">
                <h3 className={clsx("font-bold", isUnlocked ? "text-slate-800" : "text-slate-500")}>
                    {achievement.title}
                </h3>
                <p className="text-xs text-slate-500">{achievement.description}</p>

                {isUnlocked && (
                    <div className="mt-2 text-[10px] font-bold text-[#4A7C59] uppercase tracking-wider flex items-center gap-1">
                        Completed {new Date(achievement.unlockedAt!).toLocaleDateString()}
                    </div>
                )}

                <div className="mt-1 text-xs font-mono text-slate-400">
                    Reward: <span className="text-[#D4A373] font-bold">{achievement.reward.amount} {achievement.reward.type}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default Achievements;
