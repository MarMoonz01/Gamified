import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, Shield } from 'lucide-react';
import clsx from 'clsx';

export type AgentType = 'IGRIS' | 'BERU' | 'IRON';

export interface AgentProps {
    type: AgentType;
    message?: string;
    isActive?: boolean;
    onClick?: () => void;
}

const AgentConfig = {
    IGRIS: {
        name: 'COMMANDER IGRIS',
        color: 'text-red-500',
        borderColor: 'border-red-500',
        icon: AlertTriangle,
    },
    BERU: {
        name: 'MARSHAL BERU',
        color: 'text-purple-400',
        borderColor: 'border-purple-500',
        icon: Info,
    },
    IRON: {
        name: 'TANK IRON',
        color: 'text-yellow-500',
        borderColor: 'border-yellow-500',
        icon: Shield,
    },
};

const Agent: React.FC<AgentProps> = ({ type, message, isActive = false, onClick }) => {
    const config = AgentConfig[type];
    const Icon = config.icon;
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (message) {
            setDisplayedText('');
            let i = 0;
            const timer = setInterval(() => {
                setDisplayedText(message.substring(0, i + 1));
                i++;
                if (i === message.length) clearInterval(timer);
            }, 20);
            return () => clearInterval(timer);
        }
    }, [message]);

    if (!isActive) return null; // Only show active agents/notifications

    return (
        <motion.div
            layout
            onClick={onClick}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={clsx(
                "cursor-pointer group system-alert p-4 mb-4"
            )}
        >
            <div className="flex items-start gap-3">
                <Icon className={clsx("mt-1", config.color)} size={20} />
                <div>
                    <div className={clsx("font-header tracking-wider text-sm mb-1", config.color)}>
                        SYSTEM NOTIFICATION: {config.name}
                    </div>
                    <div className="font-mono text-white/90 text-sm leading-relaxed">
                        {message ? displayedText : "..."}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Agent;
