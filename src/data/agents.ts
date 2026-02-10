import type { AgentType } from "../components/Agent";

export type AgentContext = 'GREETING' | 'TASK_COMPLETE' | 'TASK_FAIL' | 'LEVEL_UP' | 'LOW_HP' | 'LOW_MP' | 'IDLE';

export interface AgentProfile {
    id: AgentType;
    name: string;
    dialogues: Record<AgentContext, string[]>;
}

export const AGENTS_DATA: Record<AgentType, AgentProfile> = {
    IGRIS: {
        id: 'IGRIS',
        name: 'Igrit',
        dialogues: {
            GREETING: [
                "My Liege. The Daily Battle Plan awaits.",
                "Discipline is the only path to the throne.",
                "I stand ready to serve."
            ],
            TASK_COMPLETE: [
                "Excellent form, my Liege.",
                "Another victory for the Shadow Monarch.",
                "Your will is absolute.",
                "Proceeding to the next objective."
            ],
            TASK_FAIL: [
                "Do not falter, my Liege.",
                "We must remain vigilant.",
                "A minor setback. Regroup."
            ],
            LEVEL_UP: [
                "YOUR POWER GROWS!",
                "A king must be strong!",
                "I am honored to witness your ascension."
            ],
            LOW_HP: [
                "My Liege! You are wounded!",
                "Retreat and recover! Do not be reckless!",
                "Protect the Monarch!"
            ],
            LOW_MP: [
                "Your mana is depleted.",
                "Rest, my Liege.",
                "Usage limit reached."
            ],
            IDLE: [
                "Awaiting orders.",
                "The shadows whisper your name.",
                "Guard mode: Active."
            ]
        }
    },
    BERU: {
        id: 'BERU',
        name: 'Beru',
        dialogues: {
            GREETING: [
                "Kieeek! The King has returned!",
                "My King! Shall we consume the world today?",
                "Glory to the Monarch!"
            ],
            TASK_COMPLETE: [
                "Kieeeek! Delicious experience!",
                "More! I need more for the King!",
                "Your brilliance blinds me!",
                "For the King!"
            ],
            TASK_FAIL: [
                "Kiek? Impossible!",
                "Who dares stop the King?!",
                "I will devour the obstacle!"
            ],
            LEVEL_UP: [
                "OH MY KING! THE POWER!",
                "THE KING IS SUPREME!",
                "KIEEEEK! GLORY!"
            ],
            LOW_HP: [
                "MY KING IS BLEEDING! WHO DID THIS?!",
                "I WILL EAT THEM! I WILL EAT THEM ALL!",
                "HEAL! HEAL NOW!"
            ],
            LOW_MP: [
                "The King needs mana!",
                "Hungry... for magic...",
                "Kiek... tired..."
            ],
            IDLE: [
                "Kiek... kiek...",
                "Watching... always watching...",
                "The ants are working, my King."
            ]
        }
    },
    IRON: {
        id: 'IRON',
        name: 'Iron',
        dialogues: {
            GREETING: [
                "WOAH! KING!",
                "TRAIN! MUSCLES!",
                "PROTECT!"
            ],
            TASK_COMPLETE: [
                "STRONG! VERY STRONG!",
                "GOOD! MORE!",
                "YEAH! MUSCLES!",
                "LIGHT WEIGHT!"
            ],
            TASK_FAIL: [
                "GRAAAH! TRY AGAIN!",
                "NO GIVE UP!",
                "WEAKNESS LEAVING BODY!"
            ],
            LEVEL_UP: [
                "KING BIGGER! KING STRONGER!",
                "ROAAAAR!",
                "LEVEL UP! YEAH!"
            ],
            LOW_HP: [
                "BLOCK! IRON BLOCK!",
                "KING HURT! IRON ANGRY!",
                "SHIELD UP!"
            ],
            LOW_MP: [
                "Sleepy...",
                "No magic... only fists...",
                "Nap time?"
            ],
            IDLE: [
                "Flex...",
                "Hungry...",
                "Train?"
            ]
        }
    }
};
