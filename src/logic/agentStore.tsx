import { create } from 'zustand';
import { AGENTS_DATA, type AgentContext } from '../data/agents';
import type { AgentType } from '../components/Agent';

interface AgentState {
    // Current Global Message (for Activity Feed)
    message: string | null;
    type: 'GREETING' | 'TASK_COMPLETE' | 'TASK_FAIL' | 'LEVEL_UP' | 'LOW_HP' | 'LOW_MP' | 'IDLE' | 'SYSTEM' | 'ERROR' | null;

    // Per-Agent Messages (for Columns)
    messages: Record<AgentType, string>;

    triggerMessage: (agentId: AgentType, context: AgentContext) => void;
    setCustomMessage: (agentId: AgentType, message: string, type?: AgentState['type']) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
    message: null,
    type: null,
    messages: {
        IGRIS: AGENTS_DATA.IGRIS.dialogues.GREETING[0],
        BERU: AGENTS_DATA.BERU.dialogues.GREETING[0],
        IRON: AGENTS_DATA.IRON.dialogues.GREETING[0],
    },
    triggerMessage: (agentId: AgentType, context: AgentContext) => {
        const agentData = AGENTS_DATA[agentId];
        const options = agentData.dialogues[context];
        const randomMessage = options[Math.floor(Math.random() * options.length)];

        set((state: AgentState) => ({
            message: randomMessage,
            type: context as AgentState['type'],
            messages: {
                ...state.messages,
                [agentId]: randomMessage
            }
        }));
    },
    setCustomMessage: (agentId: AgentType, text: string, type = 'SYSTEM') => {
        set((state: AgentState) => ({
            message: text,
            type: type,
            messages: {
                ...state.messages,
                [agentId]: text
            }
        }));

        // Clear global message after delay
        setTimeout(() => {
            set({ message: null, type: null });
        }, 6000);
    }
}));
