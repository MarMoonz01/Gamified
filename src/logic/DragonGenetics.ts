import type { Egg } from './dragonStore';

// DNA Structure defining the visual and identity traits
export interface DragonDNA {
    palette: {
        primary: string;
        secondary: string;
        accent: string;
        eye: string;
    };
    headType: 'SAURIAN' | 'BEAST' | 'SERPENT';
    wingType: 'BAT' | 'FEATHERED' | 'NONE' | 'ENERGY';
    tailType: 'SPIKED' | 'FINNED' | 'WHIP';
    accessories: string[]; // e.g. "Horns", "Aura"
}

export const generateDragonName = (history: Egg['history']): string => {
    // 1. Identify Peak Stats
    const stats = Object.entries(history);
    // Sort by value desc
    stats.sort((a, b) => b[1] - a[1]);

    const topStat = stats[0][0];
    const secondStat = stats[1] ? stats[1][0] : '';

    // 2. Prefixes (Based on dominant stat - The "Element")
    const prefixes: Record<string, string[]> = {
        writing: ['Ink', 'Scribe', 'Glyph', 'Rune', 'Paper', 'Scroll'],
        reading: ['Mind', 'Astral', 'Wise', 'Flux', 'Star', 'Void'],
        listening: ['Echo', 'Flow', 'River', 'Deep', 'Sonar', 'Tide'],
        speaking: ['Roar', 'Voice', 'Gale', 'Storm', 'Thunder', 'Song'],
        health: ['Iron', 'Terra', 'Moss', 'Bark', 'Vita', 'Root'],
        gold: ['Gilded', 'Coin', 'Lux', 'Gem', 'Hoard', 'Rich'],
        // Fallbacks
        study: ['Focus', 'Grey'],
        social: ['Bright', 'Kin']
    };

    // 3. Suffixes (Based on secondary stat - The "Role")
    const suffixes: Record<string, string[]> = {
        writing: ['weaver', 'binder', 'claw', 'quill'],
        reading: ['seer', 'gazer', 'watcher', 'mind'],
        listening: ['fin', 'ear', 'drifter', 'hunter'],
        speaking: ['caller', 'singer', 'wing', 'breath'],
        health: ['shell', 'scale', 'guard', 'heart'],
        gold: ['thief', 'keeper', 'king', 'tooth']
    };

    const pList = prefixes[topStat] || prefixes['study'];
    const sList = suffixes[secondStat] || suffixes['health'];

    const prefix = pList[Math.floor(Math.random() * pList.length)];
    const suffix = sList[Math.floor(Math.random() * sList.length)];

    return `${prefix}${suffix}`;
};

export const generateDragonDNA = (egg: Egg): DragonDNA => {
    const h = egg.history;
    // const total = Object.values(h).reduce((a, b) => a + b, 0) || 1;

    // --- 1. Palette Generation (Weighted Color Mixing) ---
    // We'll pick the top domain for Primary, second for Secondary

    const getStatColor = (stat: string) => {
        switch (stat) {
            case 'writing': return '#EF4444'; // Red
            case 'listening': return '#3B82F6'; // Blue
            case 'speaking': return '#F59E0B'; // Yellow
            case 'reading': return '#8B5CF6'; // Purple
            case 'health': return '#10B981'; // Green
            case 'gold': return '#D4AF37'; // Gold
            default: return '#78716C'; // Stone
        }
    };

    const sortedStats = Object.entries(h).sort((a, b) => b[1] - a[1]);
    const topStat = sortedStats[0][0];
    const subStat = sortedStats[1] && sortedStats[1][1] > 0 ? sortedStats[1][0] : topStat;

    // --- 2. Body Parts (Based on Stat ratios) ---
    // Head: Reading/Writing (Intellect) -> Saurian, Health/Gold -> Beast, Social/Listening -> Serpent
    let headType: DragonDNA['headType'] = 'SAURIAN';
    if (h.health + h.gold > h.reading + h.writing) headType = 'BEAST';
    if (h.listening + h.speaking > h.health + h.gold) headType = 'SERPENT';

    // Wings: Speaking/Social (Air) -> Feathered, Writing/Reading (Arcane) -> Energy, Health -> Bat, Listening -> None (Swimmer)
    let wingType: DragonDNA['wingType'] = 'BAT';
    if (h.speaking > 10) wingType = 'FEATHERED';
    else if (h.listening > 10) wingType = 'NONE'; // Aquatic
    else if (h.reading > 15) wingType = 'ENERGY';

    // Tail
    let tailType: DragonDNA['tailType'] = 'SPIKED';
    if (h.listening > h.writing) tailType = 'FINNED';
    if (h.speaking > h.health) tailType = 'WHIP';

    return {
        palette: {
            primary: getStatColor(topStat),
            secondary: getStatColor(subStat),
            accent: '#FFFFFF', // Default accent
            eye: egg.rarity === 'LEGENDARY' ? '#00FFFF' : '#FCD34D'
        },
        headType,
        wingType,
        tailType,
        accessories: egg.rarity === 'LEGENDARY' ? ['CROWN', 'AURA'] : []
    };
};
