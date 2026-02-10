import React from 'react';
import { motion } from 'framer-motion';
import {
    GlassWater, Moon, Sun, Dumbbell, Book, Code,
    Sword, Shield, Brain, Activity, Edit, Sparkles
} from 'lucide-react';

export type PresetCategory = 'HEALTH' | 'POWER' | 'WISDOM' | 'DAILY' | 'DUNGEON';

export interface PresetOption {
    id: string;
    label: string;
    icon: any;
    category: PresetCategory;
}

const PRESETS: PresetOption[] = [
    // Health
    { id: 'water', label: 'Hydration', icon: GlassWater, category: 'HEALTH' },
    { id: 'sleep', label: 'Sleep 8h', icon: Moon, category: 'HEALTH' },
    { id: 'meditate', label: 'Meditate', icon: Brain, category: 'HEALTH' },
    { id: 'walk', label: 'Daily Walk', icon: Sun, category: 'HEALTH' },

    // Power
    { id: 'workout', label: 'Workout', icon: Dumbbell, category: 'POWER' },
    { id: 'stretch', label: 'Stretch', icon: Activity, category: 'POWER' },
    { id: 'pushups', label: 'Push-ups', icon: Sword, category: 'POWER' },

    // Wisdom
    { id: 'read', label: 'Read 30m', icon: Book, category: 'WISDOM' },
    { id: 'code', label: 'Code', icon: Code, category: 'WISDOM' },
    { id: 'journal', label: 'Journal', icon: Edit, category: 'WISDOM' },

    // Daily
    { id: 'morning_routine', label: 'Morning Protocol', icon: Sun, category: 'DAILY' },
    { id: 'night_routine', label: 'Night Protocol', icon: Moon, category: 'DAILY' },
    { id: 'clean', label: 'Clean HQ', icon: Shield, category: 'DAILY' },
];

interface PresetSelectorProps {
    category?: PresetCategory;
    onSelect: (label: string) => void;
    onClose: () => void;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({ category, onSelect, onClose }) => {

    const filteredPresets = category
        ? PRESETS.filter(p => p.category === category || p.category === 'DAILY') // Show DAILY for relevant contexts
        : PRESETS;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black/90 border border-blue-500/50 p-6 rounded-lg max-w-lg w-full shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-header text-xl text-blue-400 tracking-widest">
                        SELECT PROTOCOL
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {filteredPresets.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => {
                                onSelect(preset.label);
                                onClose();
                            }}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded hover:bg-blue-500/20 hover:border-blue-500 transition-all group"
                        >
                            <div className="text-blue-400 group-hover:text-white transition-colors">
                                <preset.icon size={24} />
                            </div>
                            <span className="text-xs font-mono text-gray-400 group-hover:text-blue-200 text-center">
                                {preset.label}
                            </span>
                        </button>
                    ))}

                    {/* Custom Option Placeholder */}
                    <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded hover:bg-yellow-500/20 hover:border-yellow-500 transition-all group opacity-50 cursor-not-allowed">
                        <div className="text-gray-600 group-hover:text-yellow-500">
                            <Sparkles size={24} />
                        </div>
                        <span className="text-xs font-mono text-gray-600 group-hover:text-yellow-200">
                            Custom (Locked)
                        </span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PresetSelector;
