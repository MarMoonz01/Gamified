
export type DragonRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type DragonElement = 'FIRE' | 'WATER' | 'WIND' | 'TERRA' | 'RADIANT' | 'ARCANE';

export interface DragonDefinition {
    id: string;
    name: string; // The species name, e.g. "Crimson Flare"
    element: DragonElement;
    rarity: DragonRarity;
    description: string;
    trigger: string; // Hint for how to get it, e.g. "High Reading Focus"
}

export const DRAGON_BESTIARY: DragonDefinition[] = [
    // --- FIRE (Gold/Writing/Action) ---
    {
        id: 'fire-1',
        name: 'Ember Whelp',
        element: 'FIRE',
        rarity: 'COMMON',
        description: 'A small playful dragon that sneezes sparks. It loves the energy of a busy morning.',
        trigger: 'High Activity / Writing'
    },
    {
        id: 'fire-2',
        name: 'Crimson Sentinel',
        element: 'FIRE',
        rarity: 'RARE',
        description: 'A guardian of the forge. Its scales are as hard as obsidian and warm to the touch.',
        trigger: 'Very High Writing & Heat'
    },

    // --- WATER (Listening/Fluidity) ---
    {
        id: 'water-1',
        name: 'River Skipper',
        element: 'WATER',
        rarity: 'COMMON',
        description: 'Often found napping on lily pads. It thrives on the flow of conversation.',
        trigger: 'Listening tasks'
    },
    {
        id: 'water-2',
        name: 'Abyssal Glider',
        element: 'WATER',
        rarity: 'RARE',
        description: 'A silent swimmer from the deep lakes. It absorbs knowledge like a sponge.',
        trigger: 'High Listening & Deep Focus'
    },

    // --- WIND (Speaking/Freedom) ---
    {
        id: 'wind-1',
        name: 'Zephyr Messenger',
        element: 'WIND',
        rarity: 'COMMON',
        description: 'A fast flyer that carries whispers of distant lands. It loves vocal exercises.',
        trigger: 'Speaking tasks'
    },
    {
        id: 'wind-2',
        name: 'Storm Caller',
        element: 'WIND',
        rarity: 'RARE',
        description: 'Its wings generate static electricity. It appears when one speaks with thunderous conviction.',
        trigger: 'High Speaking & Confidence'
    },

    // --- TERRA (Health/Consistency) ---
    {
        id: 'terra-1',
        name: 'Mossy Pebble',
        element: 'TERRA',
        rarity: 'COMMON',
        description: 'Resembles a rock when sleeping. It grows stronger with steady, healthy habits.',
        trigger: 'Health & Consistency'
    },
    {
        id: 'terra-2',
        name: 'Gaia Guardian',
        element: 'TERRA',
        rarity: 'EPIC',
        description: 'A massive dragon with bark-like scales. It represents unshakeable physical discipline.',
        trigger: 'Long Streaks in Health'
    },

    // --- ARCANE (Reading/Study) ---
    {
        id: 'arcane-1',
        name: 'Rune Seeker',
        element: 'ARCANE',
        rarity: 'COMMON',
        description: 'A curious dragon that eats ink. It is attracted to the smell of old books.',
        trigger: 'Reading tasks'
    },
    {
        id: 'arcane-2',
        name: 'Astral Weaver',
        element: 'ARCANE',
        rarity: 'EPIC',
        description: 'It weaves starlight into knowledge. Only appears to those with vast mental libraries.',
        trigger: 'High Reading & Intelligence'
    },

    // --- RADIANT (Social/Leadership) ---
    {
        id: 'radiant-1',
        name: 'Sunbeam Sprite',
        element: 'RADIANT',
        rarity: 'RARE',
        description: 'A glowing spirit that brings warmth to social gatherings.',
        trigger: 'Social tasks'
    },
    {
        id: 'radiant-2',
        name: 'Golden Sovereign',
        element: 'RADIANT',
        rarity: 'LEGENDARY',
        description: 'A majestic ruler of the skies. It demands absolute mastery of all skills.',
        trigger: 'Balanced High Stats'
    }
];
