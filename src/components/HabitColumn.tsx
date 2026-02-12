import React, { useState } from 'react';
import { Plus, Scroll } from 'lucide-react';
import { useDragonStore } from '../logic/dragonStore';

import HabitItem from './HabitItem';
import PresetSelector from './PresetSelector';
import Parchment from './ui/Parchment';

const HabitColumn: React.FC = () => {
    const { habits, addHabit } = useDragonStore();

    const [showPresets, setShowPresets] = useState(false);

    const handleSelect = (label: string) => {
        addHabit(label, 'BOTH');

    };

    return (
        <Parchment title="Commissions" variant="aged" className="h-full">
            <div className="flex flex-col h-full">
                {/* List */}
                <div className="flex-1 space-y-3 pb-4">
                    {habits.map(habit => (
                        <HabitItem key={habit.id} habit={habit} />
                    ))}

                    {habits.length === 0 && (
                        <div className="text-center text-fantasy-wood/50 mt-10 font-fantasy text-sm italic flex flex-col items-center gap-2">
                            <Scroll size={32} className="opacity-50" />
                            No Active Contracts
                        </div>
                    )}
                </div>

                {/* Quick Add Area */}
                <div className="mt-auto pt-4 border-t border-fantasy-wood/20">
                    <button
                        onClick={() => setShowPresets(true)}
                        className="w-full py-2 border-2 border-dashed border-fantasy-wood/30 rounded-sm flex items-center justify-center gap-2 text-fantasy-wood hover:border-fantasy-gold hover:text-fantasy-wood-dark hover:bg-fantasy-wood/5 transition-all group font-fantasy tracking-wider text-sm"
                    >
                        <Plus size={16} className="group-hover:scale-110 transition-transform" />
                        <span>NEW CONTRACT</span>
                    </button>
                </div>

                {/* Preset Modal */}
                {showPresets && (
                    <PresetSelector
                        category="HEALTH"
                        onSelect={handleSelect}
                        onClose={() => setShowPresets(false)}
                    />
                )}
            </div>
        </Parchment>
    );
};

export default HabitColumn;
