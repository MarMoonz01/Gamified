import type { DragonType } from './dragonStore';

const TITLES = {
    ARCANE: ['Scholar', 'Mage', 'Sage', 'Weaver', 'Oracle'],
    TERRA: ['Warden', 'Guardian', 'Titan', 'Sentinel', 'Keeper'],
    WIND: ['Scout', 'Courier', 'Spirit', 'Dancer', 'Whisper'],
    FIRE: ['Forgemaster', 'Igniter', 'Phoenix', 'Ember', 'Wrath'],
    WATER: ['Tidecaller', 'Healer', 'Mystic', 'Flow', 'Reflection'],
    RADIANT: ['Luminary', 'Beacon', 'Herald', 'Star', 'Vanguard']
};

const TEMPLATES = [
    "Born from your dedication to {SOURCE}, this dragon embodies the virtue of {VIRTUE}.",
    "The egg cracked under the weight of your {SOURCE} efforts, revealing a creature of pure {ELEMENT}.",
    "A legendary companion who thrives on the energy of your {SOURCE}. It watches over your progress.",
    "Forged in the fires of your ambition for {SOURCE}, it seeks to aid you in your journey.",
    "This dragon hums with the resonance of your recent {SOURCE} sessions."
];

const SOURCE_MAP: Record<DragonType, string> = {
    ARCANE: "Study",
    TERRA: "Health",
    WIND: "Adventure",
    FIRE: "Creativity",
    WATER: "Connection",
    RADIANT: "Leadership"
};

const VIRTUE_MAP: Record<DragonType, string> = {
    ARCANE: "Wisdom",
    TERRA: "Vitality",
    WIND: "Freedom",
    FIRE: "Passion",
    WATER: "Empathy",
    RADIANT: "Charisma"
};

export const generateLore = (type: DragonType, history: any): { name: string, lore: string } => {
    // Generate Name
    const titles = TITLES[type];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const name = `The ${randomTitle} of ${SOURCE_MAP[type]}`;

    // Generate Lore
    const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    let lore = template
        .replace('{SOURCE}', SOURCE_MAP[type])
        .replace('{VIRTUE}', VIRTUE_MAP[type])
        .replace('{ELEMENT}', type.toLowerCase());

    // Add a specific detail from history if high stats
    if (history.reading > 500 && type === 'ARCANE') lore += " Its eyes glow with the knowledge of a thousand pages.";
    if (history.health > 500 && type === 'TERRA') lore += " It carries the strength of your endurance.";

    return { name, lore };
};
