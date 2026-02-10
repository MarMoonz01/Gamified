import React from 'react';
import HabitColumn from '../components/HabitColumn';
import DailyColumn from '../components/DailyColumn';
import DungeonColumn from '../components/DungeonColumn';

const Quests: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-6">
            <div className="system-panel overflow-hidden flex flex-col h-full rounded-xl">
                <HabitColumn />
            </div>
            <div className="system-panel overflow-hidden flex flex-col h-full rounded-xl">
                <DailyColumn />
            </div>
            <div className="system-panel overflow-hidden flex flex-col h-full rounded-xl">
                <DungeonColumn />
            </div>
        </div>
    );
};

export default Quests;
