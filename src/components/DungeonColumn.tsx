import React from 'react';
import { Skull, Map } from 'lucide-react';
import { useDragonStore, type Rank } from '../logic/dragonStore';

import TodoItem from './TodoItem';
import Parchment from './ui/Parchment';

const DungeonColumn: React.FC = () => {
    const { tasks: todos, addTask: addTodo } = useDragonStore();


    const generateDungeon = () => {
        const adjectives = ['Haunted', 'Cursed', 'Abyssal', 'Frozen', 'Burning', 'Toxic', 'Mystic'];
        const nouns = ['Library', 'Gym', 'Server Room', 'Catacombs', 'Spire', 'Void', 'Lair'];
        const randomTitle = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;

        const ranks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
        const randomRank = ranks[Math.floor(Math.random() * ranks.length)];

        // @ts-ignore - Temporary ignore until store update
        addTodo(randomTitle, 'GOLD', randomRank, "A hidden scroll has been discovered. Complete it to obtain rewards.");

    };

    return (
        <Parchment title="Adventures" variant="burned" className="h-full">
            <div className="flex flex-col h-full">
                {/* List */}
                <div className="flex-1 space-y-4 pb-4">
                    {todos.map(todo => (
                        <TodoItem key={todo.id} todo={todo} />
                    ))}

                    {todos.length === 0 && (
                        <div className="text-center text-fantasy-wood/50 mt-10 font-fantasy text-sm italic flex flex-col items-center gap-2">
                            <Map size={32} className="opacity-50" />
                            The Realm is Safe... for now.
                        </div>
                    )}
                </div>

                {/* Generate Button Area */}
                <div className="mt-auto pt-4 border-t border-fantasy-wood/20">
                    <button
                        onClick={generateDungeon}
                        className="w-full py-2 bg-fantasy-red/10 border-2 border-dashed border-fantasy-red/30 rounded-sm flex items-center justify-center gap-2 text-fantasy-red hover:bg-fantasy-red/20 hover:border-fantasy-red/50 transition-all group font-fantasy tracking-wider text-sm shadow-[0_0_10px_rgba(139,0,0,0.1)]"
                    >
                        <Skull size={18} className="group-hover:animate-pulse" />
                        <span className="drop-shadow-sm font-bold">SCOUT DUNGEON</span>
                    </button>
                    {/* Manual Add Placeholder - could add a form here later */}
                    <div className="text-[10px] text-center text-fantasy-wood/40 mt-2 font-inter">
                        * Scouting reveals random tasks *
                    </div>
                </div>
            </div>
        </Parchment>
    );
};

export default DungeonColumn;
