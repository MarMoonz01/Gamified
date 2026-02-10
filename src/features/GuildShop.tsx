import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Coins, Gift, Coffee, Music, Zap } from 'lucide-react';
import { useDragonStore } from '../logic/dragonStore';
import Parchment from '../components/ui/Parchment';
import { useNavigate } from 'react-router-dom';

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
    { id: '3', name: 'Elixir of Energy', description: 'Buy a real-life energy drink.', cost: 100, icon: Zap, color: 'yellow' },
    { id: '4', name: 'Mystery Box', description: 'A random small reward.', cost: 75, icon: Gift, color: 'red' },
];

const GuildShop: React.FC = () => {
    const { gold, spendGold } = useDragonStore();
    const navigate = useNavigate();
    const [message, setMessage] = useState<string | null>(null);

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

    return (
        <div className="min-h-screen bg-black/90 p-6 flex flex-col items-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 relative z-10">
                <button
                    onClick={() => navigate('/world')}
                    className="text-fantasy-wood/60 hover:text-fantasy-gold transition-colors font-medieval tracking-widest"
                >
                    ← LEAVE SHOP
                </button>
                <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full border border-fantasy-gold/30">
                    <Coins className="text-fantasy-gold" />
                    <span className="text-fantasy-gold font-bold font-mono text-xl">{gold}</span>
                </div>
            </div>

            <Parchment className="w-full max-w-5xl flex-1 relative z-10" variant="clean">
                <div className="text-center mb-8">
                    <ShoppingBag className="w-16 h-16 text-fantasy-wood-dark mx-auto mb-2" />
                    <h1 className="text-4xl font-medieval text-fantasy-wood-dark tracking-wide">MERCHANT'S OUTPOST</h1>
                    <p className="text-fantasy-wood/70 font-fantasy italic">"Got some coin? I've got the goods."</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                    {shopItems.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-fantasy-paper-light border-2 border-fantasy-wood/20 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-fantasy-wood/50 transition-all flex flex-col group relative overflow-hidden"
                        >
                            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${item.color}-500/10 rounded-full blur-xl group-hover:bg-${item.color}-500/20 transition-colors`}></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`p-3 rounded-lg bg-${item.color}-100/50 text-${item.color}-700 border border-${item.color}-200`}>
                                    <item.icon size={24} />
                                </div>
                                <div className="font-bold font-medieval text-xl text-fantasy-wood-dark">{item.cost} G</div>
                            </div>

                            <h3 className="font-medieval text-lg text-fantasy-wood-dark mb-1 relative z-10">{item.name}</h3>
                            <p className="text-sm text-fantasy-wood/70 font-fantasy mb-4 flex-1 relative z-10">{item.description}</p>

                            <button
                                onClick={() => handleBuy(item)}
                                disabled={gold < item.cost}
                                className={`w-full py-2 rounded font-bold tracking-wider transition-all relative z-10 ${gold >= item.cost
                                    ? 'bg-fantasy-wood text-fantasy-paper hover:bg-fantasy-wood-dark'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {gold >= item.cost ? 'PURCHASE' : 'NEED MORE GOLD'}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Feedback Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/90 text-fantasy-gold px-6 py-3 rounded-full border border-fantasy-gold shadow-lg font-medieval tracking-widest z-50"
                    >
                        {message}
                    </motion.div>
                )}
            </Parchment>
        </div>
    );
};

export default GuildShop;
