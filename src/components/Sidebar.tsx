import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, ScrollText, Skull, Map, Trophy } from 'lucide-react';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
    const navItems = [
        { path: '/dashboard', label: 'Status', icon: LayoutDashboard },
        { path: '/quests', label: 'Quests', icon: ScrollText },
        { path: '/dungeon', label: 'Raids', icon: Skull },
        { path: '/analysis', label: 'Analysis', icon: ScrollText },
        { path: '/achievements', label: 'Deeds', icon: Trophy },
        { path: '/profile', label: 'Hero', icon: User },
        { path: '/world', label: 'Map', icon: Map },
    ];

    return (
        <div className="h-full w-64 bg-white border-r border-slate-200 flex flex-col p-4">
            <div className="mb-8 px-2">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        G
                    </div>
                    Guild
                </h2>
            </div>

            <nav className="space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                            isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
