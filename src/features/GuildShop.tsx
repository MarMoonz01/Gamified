import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Coins, Gift, Coffee, Music, Zap, Check } from 'lucide-react';
import { useDragonStore } from '../logic/dragonStore';
import clsx from 'clsx';

interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any;
    color: string;
}

const shopItems: ShopItem[] = [
    { id: '1', name: 'Potion of Rest', description: 'Take a 15 min break without guilt.', cost: 50, icon: Coffee, color: 'blue' },
    { id: '2', name: 'Bard\'s Song', description: 'Listen to 1 hour of music while working.', cost: 30, icon: Music, color: 'purple' },
    { id: '3', name: 'Elixir of Energy', description: 'Buy a real-life energy drink.', cost: 100, icon: Zap, color: 'amber' },
    { id: '4', name: 'Mystery Box', description: 'A random small reward.', cost: 75, icon: Gift, color: 'rose' },
];

const GuildShop: React.FC = () => {
    const { gold, spendGold, userProfile, habits } = useDragonStore();
    const [message, setMessage] = useState<string | null>(null);
    const [aiRewards, setAiRewards] = useState<ShopItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAiShop, setShowAiShop] = useState(false);

    const handleBuy = (item: ShopItem) => {
        if (gold >= item.cost) {
            spendGold(item.cost);
            setMessage(`Purchased ${item.name}!`);
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage("Not enough gold!");
            setTimeout(() => setMessage(null), 2000);
        }
    };

    const generateAiRewards = async () => {
        setIsLoading(true);
        try {
            // Import dynamically to avoid circular dependency issues if any, mainly just good practice here
            const { geminiService } = await import('../logic/GeminiService');
            const rewards = await geminiService.generateRewardIdeas(userProfile, habits);
            if (rewards) {
                // Map string icons to Lucide components
                const mappedRewards = rewards.map((r: any) => ({
                    ...r,
                    icon: getIconByName(r.icon)
                }));
                setAiRewards(mappedRewards);
                setShowAiShop(true);
            }
        } catch (error) {
            console.error("Failed to generate AI rewards", error);
            setMessage("The merchant is confused... try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getIconByName = (name: string) => {
        switch (name) {
            case 'Coffee': return Coffee;
            case 'Music': return Music;
            case 'Zap': return Zap;
            case 'Gift': return Gift;
            case 'Book': return ShoppingBag; // Fallback
            case 'Gamepad': return ShoppingBag; // Fallback
            case 'Star': return Gift;
            default: return ShoppingBag;
        }
    };

    return (
        <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <ShoppingBag className="text-blue-500" size={32} />
                        Guild Shop
                    </h1>
                    <p className="text-slate-500 mt-1">Spend your hard-earned gold on real-life rewards.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={generateAiRewards}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 rounded-xl transition-all font-medium border border-indigo-200"
                    >
                        {isLoading ? <Zap className="animate-spin" size={18} /> : <Zap size={18} />}
                        {isLoading ? 'Consulting the Oracle...' : 'Curate for Me'}
                    </button>

                    <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Coins size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance</span>
                            <div className="text-2xl font-bold text-slate-800">{gold}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAiShop ? aiRewards : shopItems).map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                        {/* Background Decoration */}
                        <div className={clsx(
                            "absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-transform group-hover:scale-110",
                            item.color === 'blue' && "bg-blue-500",
                            item.color === 'purple' && "bg-purple-500",
                            item.color === 'amber' && "bg-amber-500",
                            item.color === 'rose' && "bg-rose-500"
                        )} />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className={clsx(
                                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                item.color === 'blue' && "bg-blue-50 text-blue-600",
                                item.color === 'purple' && "bg-purple-50 text-purple-600",
                                item.color === 'amber' && "bg-amber-50 text-amber-600",
                                item.color === 'rose' && "bg-rose-50 text-rose-600"
                            )}>
                                <item.icon size={28} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-2">{item.name}</h3>
                            <p className="text-slate-500 text-sm mb-6 flex-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                {item.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="font-bold text-lg text-slate-700 flex items-center gap-1">
                                    {item.cost} <span className="text-amber-500 text-sm">G</span>
                                </div>
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={gold < item.cost}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                                        gold >= item.cost
                                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl hover:shadow-slate-200"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    )}
                                >
                                    {gold >= item.cost ? 'Purchase' : 'Not Enough'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-24 left-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-slate-700"
                    >
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="font-medium">{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GuildShop;
