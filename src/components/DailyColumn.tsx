import React, { useState } from 'react';
import { Plus, Scroll } from 'lucide-react';
import { useDragonStore } from '../logic/dragonStore';

import DailyItem from './DailyItem';
import PresetSelector from './PresetSelector';
import Parchment from './ui/Parchment';

const DailyColumn: React.FC = () => {
    const { dailies, addDaily } = useDragonStore();

    const [showPresets, setShowPresets] = useState(false);

    const handleSelect = (label: string) => {
        addDaily(label);
    };

    return (
        <Parchment title="Daily Quests" variant="aged" className="h-full">
            <div className="flex flex-col h-full">
                {/* List */}
                <div className="flex-1 space-y-3 pb-4">
                    {dailies.map(daily => (
                        <DailyItem key={daily.id} daily={daily} />
                    ))}

                    {dailies.length === 0 && (
                        <div className="text-center text-fantasy-wood/50 mt-10 font-fantasy text-sm italic flex flex-col items-center gap-2">
                            <Scroll size={32} className="opacity-50" />
                            No Active Quests
                        </div>
                    )}
                </div>

                {/* Quick Add Area */}
                <div className="mt-auto pt-4 border-t border-fantasy-wood/20">
                    <button
                        onClick={() => setShowPresets(true)}
                        className="w-full py-2 border-2 border-dashed border-fantasy-wood/30 rounded-sm flex items-center justify-center gap-2 text-fantasy-wood hover:border-fantasy-purple hover:text-fantasy-wood-dark hover:bg-fantasy-purple/5 transition-all group font-fantasy tracking-wider text-sm"
                    >
                        <Plus size={16} className="group-hover:scale-110 transition-transform" />
                        <span>NEW QUEST</span>
                    </button>
                </div>

                {/* Preset Modal */}
                {showPresets && (
                    <PresetSelector
                        category="DAILY"
                        onSelect={handleSelect}
                        onClose={() => setShowPresets(false)}
                    />
                )}
            </div>
        </Parchment>
    );
};

export default DailyColumn;
