
export interface OracleCard {
    id: string;
    name: string;
    title: string;
    description: string;
    effectDescription: string;
    rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
    type: 'SUPPORT' | 'COMBAT' | 'RESOURCE';
    image?: string; // Placeholder for now
}

export const ORACLE_CARDS: OracleCard[] = [
    {
        id: 'c_keeper',
        name: 'The Keeper',
        title: 'Guardian of the Nest',
        description: 'A gentle dragon protecting a clutch of eggs. Its scales shimmer with the warmth of life.',
        effectDescription: '+10% Essence from all sources.',
        rarity: 'COMMON',
        type: 'RESOURCE'
    },
    {
        id: 'c_shadow',
        name: 'The Shadow',
        title: 'Walker of the Void',
        description: 'A silhouette that moves against the wind. It whispers secrets of the old world.',
        effectDescription: '+5% Critical Success chance in Scribe Mode.',
        rarity: 'RARE',
        type: 'COMBAT'
    },
    {
        id: 'c_scholar',
        name: 'The Scholar',
        title: 'Seeker of Truth',
        description: 'An ancient dragon wearing spectacles of crystal, reading a scroll that never ends.',
        effectDescription: 'Reading Tasks generate +15 Bonus Experience.',
        rarity: 'COMMON',
        type: 'SUPPORT'
    },
    {
        id: 'c_hoarder',
        name: 'The Hoarder',
        title: 'King of Gold',
        description: 'A dragon sleeping atop a mountain of coins. It dreams only of accumulation.',
        effectDescription: 'Daily Gold Tasks yield +20% Gold.',
        rarity: 'COMMON',
        type: 'RESOURCE'
    },
    {
        id: 'c_flame',
        name: 'The Eternal Flame',
        title: 'Spirit of Fire',
        description: 'A being of pure energy. It burns not with heat, but with passion.',
        effectDescription: 'Fire Dragons hatch 20% faster.',
        rarity: 'RARE',
        type: 'SUPPORT'
    },
    {
        id: 'c_void',
        name: 'The Void Gazer',
        title: 'Eye of the Abyss',
        description: 'It stared into the abyss, and the abyss blinked first.',
        effectDescription: 'Unlocks "Dark Mode" aesthetics for the Sanctuary. (Cosmetic)',
        rarity: 'LEGENDARY',
        type: 'SUPPORT'
    }
];
