import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';


// --- Types ---

export type DragonType = 'ARCANE' | 'TERRA' | 'WIND' | 'FIRE' | 'WATER' | 'RADIANT';
export type DragonStage = 'EGG' | 'BABY' | 'JUVENILE' | 'ADULT' | 'ELDER';
export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

import { generateDragonName, generateDragonDNA } from './DragonGenetics';
import type { DragonDNA } from './DragonGenetics';

export interface UserProfile {
    name: string;
    age: number;
    weight: number; // kg
    height: number; // cm
    activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Super Active';
    gender: string;
    goal?: string;
}

export interface DaySummary {
    date: string;
    completed_tasks: number;
    total_tasks: number;
    heat_earned: number;
    mood: string;
    ai_analysis?: string;
}

export interface Dragon {
    id: string;
    speciesId?: string;
    name: string;
    type: DragonType;
    stage: DragonStage;
    happiness: number; // 0-100
    xp: number;
    level: number;
    lore: string;
    hatchedAt: number;
    dna: DragonDNA;
    stats: {
        strength: number; // Health/Power
        wisdom: number;   // Study/Magic
        charisma: number; // Social/Radiance
    };
}

export interface Egg {
    id: string;
    rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
    heat: number;
    requiredHeat: number;
    isReadyToHatch: boolean;
    history: {
        study: number;
        health: number;
        social: number;
        gold: number;
        reading: number;
        listening: number;
        writing: number;
        speaking: number;
    };
}

export interface Habit {
    id: string;
    title: string;
    streak: number;
    value: number; // Added for compatibility with legacy store
    type: 'HEALTH' | 'STUDY' | 'SOCIAL' | 'GOLD' | 'BOTH';
    expiresAt?: number;
}

export interface HealthCondition {
    physical: number; // 0-100 (Energy)
    mental: number;   // 0-100 (Focus)
    sleep: number;    // 0-100 (Rest Quality)
    maxPhysical: number;
    maxMental: number;
}

export interface IELTSProgress {
    reading: number;   // 0.0 - 9.0
    listening: number; // 0.0 - 9.0
    writing: number;   // 0.0 - 9.0
    speaking: number;  // 0.0 - 9.0
    overall: number;   // Calculated
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    type: 'HEALTH' | 'STUDY' | 'SOCIAL' | 'GOLD';
    rank: Rank;
    description?: string;
    expiresAt?: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // lucide icon name
    condition: (state: DragonState) => boolean;
    reward: { type: 'GOLD' | 'ESSENCE', amount: number };
    unlockedAt: number | null;
}

export const INITIAL_ACHIEVEMENTS: Omit<Achievement, 'condition'>[] = [
    { id: 'first_hatch', title: 'Dragon Born', description: 'Hatch your first dragon egg.', icon: 'Egg', reward: { type: 'ESSENCE', amount: 50 }, unlockedAt: null },
    { id: 'habit_master', title: 'Disciplined Soul', description: 'Maintain a habit streak of 7 days.', icon: 'Flame', reward: { type: 'GOLD', amount: 100 }, unlockedAt: null },
    { id: 'scholar', title: 'Seeker of Truth', description: 'Collect 10 words in your Grimoire.', icon: 'BookOpen', reward: { type: 'ESSENCE', amount: 75 }, unlockedAt: null },
    { id: 'rich', title: 'Golden Hoard', description: 'Accumulate 1000 Gold.', icon: 'Coins', reward: { type: 'ESSENCE', amount: 100 }, unlockedAt: null },
    { id: 'collector', title: 'Zoo Keeper', description: 'Have 3 or more dragons.', icon: 'PawPrint', reward: { type: 'GOLD', amount: 200 }, unlockedAt: null },
];

export interface Daily {
    id: string;
    title: string;
    completed: boolean;
    streak: number;
    type: 'HEALTH' | 'STUDY' | 'SOCIAL' | 'GOLD';
}

interface DragonState {
    // Resources
    essence: number;
    gold: number; // Score only
    spendGold: (amount: number) => boolean;

    playerName: string;
    setPlayerName: (name: string) => void;

    // Player Stats
    level: number;
    xp: number;
    maxXp: number;

    // New Health System
    health: HealthCondition;
    updateHealth: (change: Partial<HealthCondition>) => void;

    // IELTS Progress
    ielts: IELTSProgress;
    updateIELTS: (scores: Partial<IELTSProgress>) => void;

    // Entities
    dragons: Dragon[];
    activeDragonId: string | null;
    setActiveDragon: (id: string) => void;
    activeEgg: Egg | null;
    habits: Habit[];
    tasks: Task[]; // Now treated as "Dungeons" / Todos
    dailies: Daily[];
    dragonInk: number;
    collectedCards: OracleCard[];

    // User Profile & History
    userProfile: UserProfile | null;
    dailyHistory: DaySummary[];

    // Core Actions
    addHeat: (amount: number, source: string) => void;
    hatchEgg: (name: string, lore: string) => void;

    // Care & Growth
    feedDragon: (dragonId: string, amount: number) => void;
    trainDragon: (dragonId: string, type: 'STRENGTH' | 'WISDOM' | 'CHARISMA') => void;
    evolveDragon: (dragonId: string) => void;

    // ... (Existing CRUD & Boss flow)
    addHabit: (title: string, type: Habit['type'], expiresAt?: number) => void;
    triggerHabit: (id: string, direction?: 'UP' | 'DOWN') => void;
    deleteHabit: (id: string) => void;

    addTask: (title: string, type: Task['type'], rank?: Rank, description?: string, expiresAt?: number) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;

    setTasks: (tasks: Task[]) => void;

    startNewEgg: (rarity: 'COMMON' | 'RARE' | 'LEGENDARY') => void;
    resetGame: () => void;

    // Daily Logic
    lastResetDate: string;
    resetDailies: () => void;
    checkDailyReset: () => void;

    summonCharge: number;
    addSummonCharge: (amount: number) => void;
    consumeSummonCharge: () => void;
    receiveBossEgg: (rarity: 'COMMON' | 'RARE' | 'LEGENDARY', type: DragonType) => void;

    activityLog: { date: string; amount: number; source: string }[];
    getDailyHeat: () => number[];

    // --- The Grimoire (Vocab) ---
    vocabList: VocabWord[];
    addVocab: (word: string, meaning: string, type: VocabWord['type'], example?: string) => void;
    practiceVocab: (id: string, success: boolean) => void;

    // --- Oracle Deck ---
    unlockCard: (card: OracleCard) => void;
    modifyInk: (amount: number) => void;

    // --- Player Stats ---
    gainXp: (amount: number) => void;

    // --- Achievements ---
    achievements: Achievement[];
    checkAchievements: () => void;

    // --- Dailies ---
    addDaily: (title: string, type?: Daily['type']) => void;
    toggleDaily: (id: string) => void;
    deleteDaily: (id: string) => void;

    // Profile Actions
    updateProfile: (profile: Partial<UserProfile>) => void;
    recordDaySummary: (summary: DaySummary) => void;
}

export interface OracleCard {
    id: string;
    name: string;
    title: string;
    description: string;
    effectDescription: string;
    rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
    type: 'SUPPORT' | 'COMBAT' | 'RESOURCE';
    image?: string;
}

export interface VocabWord {
    id: string;
    word: string;
    meaning: string;
    type: 'n' | 'v' | 'adj' | 'adv' | 'phrase';
    example?: string;
    mastery: number; // 0 (New) -> 5 (Mastered)
    lastPracticed: number;
}

export const useDragonStore = create<DragonState>()(
    persist(
        (set, get) => ({
            // Dragon Management
            achievements: INITIAL_ACHIEVEMENTS as Achievement[],
            checkAchievements: () => {
                const state = get();
                const currentAchievements = state.achievements;
                let newUnlock = false;
                const updates: Partial<DragonState> = {};

                const updatedAchievements = currentAchievements.map(ach => {
                    if (ach.unlockedAt) return ach; // Already unlocked

                    let isMet = false;
                    switch (ach.id) {
                        case 'first_hatch': isMet = state.dragons.length > 0; break;
                        case 'habit_master': isMet = state.habits.some(h => h.streak >= 7); break;
                        case 'scholar': isMet = state.vocabList.length >= 10; break;
                        case 'rich': isMet = state.gold >= 1000; break;
                        case 'collector': isMet = state.dragons.length >= 3; break;
                    }

                    if (isMet) {
                        newUnlock = true;
                        if (ach.reward.type === 'GOLD') {
                            updates.gold = (state.gold + ach.reward.amount); // Simplification: just add to current
                        } else if (ach.reward.type === 'ESSENCE') {
                            updates.essence = (state.essence + ach.reward.amount);
                        }
                        return { ...ach, unlockedAt: Date.now() };
                    }
                    return ach;
                });

                if (newUnlock) {
                    set((prev) => ({
                        achievements: updatedAchievements,
                        gold: updates.gold !== undefined ? updates.gold : prev.gold,
                        essence: updates.essence !== undefined ? updates.essence : prev.essence
                    }));
                }
            },
            dragons: [],
            activeDragonId: null, // Track currently selected dragon
            eggs: [],
            activeEgg: null,

            // Resources
            essence: 50,
            gold: 100,
            summonCharge: 0,

            // Player Profile
            playerName: "Dragon Keeper",

            // Player Stats
            level: 1,
            xp: 0,
            maxXp: 100,

            // Health System
            health: {
                physical: 80,
                mental: 80,
                sleep: 100,
                maxPhysical: 100,
                maxMental: 100
            },
            updateHealth: (change) => set(prev => ({
                health: { ...prev.health, ...change }
            })),

            // IELTS
            ielts: {
                reading: 0.0,
                listening: 0.0,
                writing: 0.0,
                speaking: 0.0,
                overall: 0.0
            },
            updateIELTS: (scores) => set(prev => {
                const newScores = { ...prev.ielts, ...scores };
                const overall = ((newScores.reading + newScores.listening + newScores.writing + newScores.speaking) / 4);
                // Round to nearest 0.5 for IELTS standard
                const roundedOverall = Math.round(overall * 2) / 2;
                return { ielts: { ...newScores, overall: roundedOverall } };
            }),

            // Entities
            vocabList: [],
            dragonInk: 0,
            collectedCards: [],

            userProfile: null,
            dailyHistory: [],

            updateProfile: (profile) => set(prev => ({
                userProfile: prev.userProfile ? { ...prev.userProfile, ...profile } : { name: 'Keeper', age: 25, weight: 60, height: 170, activityLevel: 'Moderately Active', gender: 'Not Specified', ...profile }
            })),

            recordDaySummary: (summary) => set(prev => ({
                dailyHistory: [...prev.dailyHistory.filter(d => d.date !== summary.date), summary]
            })),

            habits: [
                { id: 'h1', title: 'Drink Water', streak: 0, value: 0, type: 'HEALTH' },
                { id: 'h2', title: 'Read 1 Page', streak: 0, value: 0, type: 'STUDY' }
            ],
            tasks: [
                { id: 't1', title: 'Setup Notion', completed: false, type: 'GOLD', rank: 'E' },
                { id: 't2', title: 'IELTS Vocab List', completed: false, type: 'STUDY', rank: 'D' }
            ],
            dailies: [],
            activityLog: [],

            getDailyHeat: () => {
                const state = get();
                const today = new Date();
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(today);
                    d.setDate(d.getDate() - (6 - i));
                    return d.toISOString().split('T')[0];
                });

                return last7Days.map(date =>
                    state.activityLog
                        .filter(log => log.date === date)
                        .reduce((sum, log) => sum + log.amount, 0)
                );
            },

            addSummonCharge: (amount) => set(state => ({
                summonCharge: Math.min(100, state.summonCharge + amount)
            })),

            consumeSummonCharge: () => set({ summonCharge: 0 }),

            receiveBossEgg: (rarity, type) => set(() => {
                const history = {
                    study: 0, health: 0, social: 0, gold: 0,
                    reading: 0, listening: 0, writing: 0, speaking: 0
                };
                if (type === 'ARCANE') { history.study = 100; history.reading = 50; }
                else if (type === 'FIRE') { history.study = 100; history.writing = 50; }
                else if (type === 'WATER') { history.social = 100; history.listening = 50; }
                else if (type === 'RADIANT') { history.social = 100; history.speaking = 50; }
                else if (type === 'TERRA') { history.health = 100; }
                else if (type === 'WIND') { history.gold = 100; }

                return {
                    activeEgg: {
                        id: uuidv4(),
                        rarity,
                        heat: 0,
                        requiredHeat: rarity === 'LEGENDARY' ? 10000 : rarity === 'RARE' ? 2500 : 500,
                        isReadyToHatch: false,
                        history
                    }
                };
            }),

            addHeat: (amount, source) => {
                set(state => {
                    const today = new Date().toISOString().split('T')[0];
                    const newLog = { date: today, amount, source };

                    if (!state.activeEgg) return { ...state, activityLog: [...state.activityLog, newLog] };

                    const newHeat = Math.min(state.activeEgg.requiredHeat, state.activeEgg.heat + amount);
                    const isReady = newHeat >= state.activeEgg.requiredHeat;
                    const newHistory = { ...state.activeEgg.history };

                    if (source === 'STUDY' || source.includes('READING') || source.includes('WRITING')) newHistory.study += amount;
                    if (source === 'HEALTH') newHistory.health += amount;
                    if (source === 'SOCIAL' || source.includes('SPEAKING') || source.includes('LISTENING')) newHistory.social += amount;
                    if (source === 'GOLD') newHistory.gold += amount;

                    if (source === 'IELTS_READING') newHistory.reading += amount;
                    if (source === 'IELTS_LISTENING') newHistory.listening += amount;
                    if (source === 'IELTS_WRITING') newHistory.writing += amount;
                    if (source === 'IELTS_SPEAKING') newHistory.speaking += amount;

                    return {
                        ...state,
                        activityLog: [...state.activityLog, newLog],
                        activeEgg: {
                            ...state.activeEgg,
                            heat: newHeat,
                            isReadyToHatch: isReady,
                            history: newHistory
                        }
                    };
                });
            },

            hatchEgg: (name, lore) => {
                set(state => {
                    if (!state.activeEgg || !state.activeEgg.isReadyToHatch) return state;

                    const dna = generateDragonDNA(state.activeEgg);
                    const proceduralName = generateDragonName(state.activeEgg.history);
                    const h = state.activeEgg.history;
                    let bestType: DragonType = 'WIND';

                    if (h.reading > h.listening && h.reading > h.speaking) bestType = 'ARCANE';
                    else if (h.writing > h.reading) bestType = 'FIRE';
                    else if (h.speaking > h.reading) bestType = 'RADIANT';
                    else if (h.listening > h.reading) bestType = 'WATER';
                    else if (h.health > h.study) bestType = 'TERRA';
                    else if (h.study > h.health) bestType = 'ARCANE';

                    if (h.gold === 100 && h.study === 0) bestType = 'WIND';

                    const newDragon: Dragon = {
                        id: uuidv4(),
                        speciesId: 'procedural',
                        name: name === "New Dragon" ? proceduralName : name,
                        type: bestType,
                        stage: 'BABY',
                        happiness: 100,
                        xp: 0,
                        level: 1,
                        lore: lore || `A unique ${bestType} dragon born from your habits.`,
                        hatchedAt: Date.now(),
                        dna: dna,
                        stats: { strength: 10, wisdom: 10, charisma: 10 } // Initial Stats
                    };

                    return {
                        ...state,
                        dragons: [...state.dragons, newDragon],
                        activeEgg: null
                    };
                });
                get().checkAchievements();
            },

            setActiveDragon: (id) => set({ activeDragonId: id }),

            feedDragon: (dragonId, amount) => {
                set(state => {
                    if (state.essence < amount) return state;
                    return {
                        ...state,
                        essence: state.essence - amount,
                        dragons: state.dragons.map(d =>
                            d.id === dragonId
                                ? { ...d, xp: d.xp + (amount * 5), happiness: Math.min(100, d.happiness + 10) }
                                : d
                        )
                    };
                });
            },

            trainDragon: (dragonId, type) => {
                set(state => {
                    const cost = 20; // Fixed Training Cost
                    if (state.essence < cost) return state;

                    return {
                        ...state,
                        essence: state.essence - cost,
                        dragons: state.dragons.map(d => {
                            if (d.id !== dragonId) return d;

                            const newStats = { ...d.stats };
                            if (type === 'STRENGTH') newStats.strength += 5;
                            if (type === 'WISDOM') newStats.wisdom += 5;
                            if (type === 'CHARISMA') newStats.charisma += 5;

                            return {
                                ...d,
                                stats: newStats,
                                xp: d.xp + 50, // Major XP boost from training
                                happiness: Math.max(0, d.happiness - 5) // Training is tiring
                            };
                        })
                    };
                });
            },

            evolveDragon: (dragonId) => {
                set(state => {
                    return {
                        ...state,
                        dragons: state.dragons.map(d => {
                            if (d.id !== dragonId) return d;

                            const requiredXp = d.level * 100;
                            if (d.xp < requiredXp) return d; // Not ready

                            // Evolution Logic
                            let nextStage = d.stage;
                            const newDna = { ...d.dna };

                            // 1. Level Up
                            const newLevel = d.level + 1;
                            const newXp = d.xp - requiredXp;

                            // 2. Check Stage Thresholds
                            if ((newLevel >= 10 && d.stage === 'BABY') ||
                                (newLevel >= 30 && d.stage === 'JUVENILE') ||
                                (newLevel >= 50 && d.stage === 'ADULT')) {

                                if (d.stage === 'BABY') nextStage = 'JUVENILE';
                                else if (d.stage === 'JUVENILE') nextStage = 'ADULT';
                                else if (d.stage === 'ADULT') nextStage = 'ELDER';

                                // 3. Mutate DNA based on Stats
                                const { strength, wisdom, charisma } = d.stats;
                                const maxStat = Math.max(strength, wisdom, charisma);

                                if (maxStat === strength) {
                                    newDna.tailType = 'SPIKED';
                                    newDna.headType = 'BEAST';
                                } else if (maxStat === wisdom) {
                                    newDna.wingType = 'FEATHERED';
                                    newDna.headType = 'SAURIAN';
                                } else {
                                    newDna.wingType = 'BAT'; // Or Finned/Elegant
                                    newDna.headType = 'SERPENT';
                                }

                                // Juvenile gets accessories
                                if (nextStage === 'JUVENILE') newDna.accessories = ['HORNS'];
                                // Adult gets wings if missing
                                if (nextStage === 'ADULT' && newDna.wingType === 'NONE') newDna.wingType = 'BAT';
                            }

                            return {
                                ...d,
                                level: newLevel,
                                xp: newXp,
                                stage: nextStage,
                                dna: newDna
                            };
                        })
                    };
                });
            },

            addHabit: (title, type, expiresAt) => set(state => ({
                habits: [...state.habits, { id: uuidv4(), title, streak: 0, value: 0, type, expiresAt }]
            })),

            triggerHabit: (id, direction = 'UP') => {
                const state = get();
                const habit = state.habits.find(h => h.id === id);
                if (!habit) return;

                if (habit.type !== 'BOTH') get().addHeat(10, habit.type);

                // Energy Logic
                let { physical, mental } = state.health;
                if (habit.type === 'HEALTH') {
                    physical = Math.max(0, physical - 5);
                    mental = Math.min(state.health.maxMental, mental + 2); // Exercise helps focus?
                } else if (habit.type === 'STUDY') {
                    mental = Math.max(0, mental - 5);
                } else if (habit.title.toLowerCase().includes('sleep') || habit.title.toLowerCase().includes('nap')) {
                    physical = Math.min(state.health.maxPhysical, physical + 20);
                    mental = Math.min(state.health.maxMental, mental + 20);
                }

                set(curr => ({
                    essence: curr.essence + 5,
                    health: { ...curr.health, physical, mental },
                    habits: curr.habits.map(h => h.id === id ? { ...h, streak: h.streak + 1, value: h.value + (direction === 'UP' ? 1 : -1) } : h)
                }));
            },

            deleteHabit: (id) => set(state => ({
                habits: state.habits.filter(h => h.id !== id)
            })),

            addTask: (title, type, rank = 'E', description, expiresAt) => set(state => ({
                tasks: [...state.tasks, { id: uuidv4(), title, completed: false, type, rank, description, expiresAt }]
            })),

            lastResetDate: new Date().toISOString().split('T')[0],

            resetDailies: () => set(state => ({
                tasks: state.tasks.filter(t => !t.expiresAt),
                habits: state.habits.filter(h => !h.expiresAt),
                dailies: state.dailies.map(d => ({ ...d, completed: false })),
                lastResetDate: new Date().toISOString().split('T')[0]
            })),

            checkDailyReset: () => {
                const today = new Date().toISOString().split('T')[0];
                const { lastResetDate, resetDailies } = get();
                if (lastResetDate !== today) {
                    resetDailies();
                }
            },

            toggleTask: (id) => {
                const state = get();
                const task = state.tasks.find(t => t.id === id);
                if (!task) return;

                if (!task.completed) {
                    // Cost Check
                    if (state.health.physical < 5 || state.health.mental < 5) {
                        // Maybe block? or just allow with penalty? 
                        // For now allow but floor at 0
                    }

                    let { physical, mental } = state.health;
                    if (task.type === 'HEALTH' || task.type === 'GOLD') physical = Math.max(0, physical - 10);
                    if (task.type === 'STUDY' || task.type === 'SOCIAL') mental = Math.max(0, mental - 10);

                    get().addHeat(50, task.type);
                    get().gainXp(20);
                    set(curr => ({
                        gold: curr.gold + 20,
                        health: { ...curr.health, physical, mental },
                        tasks: curr.tasks.map(t => t.id === id ? { ...t, completed: true } : t)
                    }));
                } else {
                    set(curr => ({
                        tasks: curr.tasks.map(t => t.id === id ? { ...t, completed: false } : t)
                    }));
                }
            },

            deleteTask: (id) => set(state => ({
                tasks: state.tasks.filter(t => t.id !== id)
            })),

            setTasks: (tasks) => set({ tasks }),

            setPlayerName: (playerName) => set({ playerName }),

            startNewEgg: (rarity) => {
                const requiredHeat = rarity === 'COMMON' ? 500 : rarity === 'RARE' ? 2500 : 10000;
                set({
                    activeEgg: {
                        id: uuidv4(),
                        rarity,
                        heat: 0,
                        requiredHeat,
                        isReadyToHatch: false,
                        history: {
                            study: 0, health: 0, social: 0, gold: 0,
                            reading: 0, listening: 0, writing: 0, speaking: 0
                        }
                    }
                });
            },

            resetGame: () => {
                localStorage.removeItem('dragon-keeper-v1');
                window.location.reload();
            },

            addVocab: (word, meaning, type) => {
                set(state => ({
                    vocabList: [
                        ...state.vocabList,
                        {
                            id: uuidv4(),
                            word,
                            meaning,
                            type,
                            mastery: 0,
                            lastPracticed: Date.now()
                        }
                    ],
                    essence: state.essence + 5 // Reward for adding knowledge
                }));
                get().checkAchievements();
            },

            practiceVocab: (id, success) => set(state => {
                const wordIndex = state.vocabList.findIndex(v => v.id === id);
                if (wordIndex === -1) return {};

                const word = state.vocabList[wordIndex];
                let newMastery = word.mastery;
                let inkBonus = 0;

                if (success) {
                    // Check if mastering for the first time
                    if (word.mastery === 4) {
                        newMastery = 5;
                        inkBonus = 1; // Award Dragon Ink!
                        // Maybe play a special sound effect here?
                    } else {
                        newMastery = Math.min(5, word.mastery + 1);
                    }
                } else {
                    newMastery = Math.max(0, word.mastery - 1);
                }

                const newVocabList = [...state.vocabList];
                newVocabList[wordIndex] = {
                    ...word,
                    mastery: newMastery,
                    lastPracticed: Date.now()
                };

                return {
                    vocabList: newVocabList,
                    essence: success ? state.essence + 10 : state.essence,
                    gold: success ? state.gold + 5 : state.gold,
                    dragonInk: state.dragonInk + inkBonus
                };
            }),

            // --- Oracle Deck ---
            unlockCard: (card) => set(state => ({
                collectedCards: [card, ...state.collectedCards],
                dragonInk: Math.max(0, state.dragonInk - 1) // Cost 1 Ink
            })),
            modifyInk: (amount) => set(state => ({
                dragonInk: Math.max(0, state.dragonInk + amount)
            })),

            spendGold: (amount) => {
                const currentGold = get().gold;
                if (currentGold >= amount) {
                    set({ gold: currentGold - amount });
                    return true;
                }
                return false;
            },

            // --- Player Stats Logic ---
            gainXp: (amount) => set(state => {
                let newXp = state.xp + amount;
                let newLevel = state.level;
                let max = state.maxXp;

                // Heal on task complete slightly?
                // For now just XP logic

                if (newXp >= max) {
                    newXp -= max;
                    newLevel += 1;
                    max = Math.floor(max * 1.5);
                    // Level Up Full Heal?
                    // health: { ...state.health, physical: 100, mental: 100 }
                }
                return {
                    xp: newXp,
                    level: newLevel,
                    maxXp: max
                };
            }),

            // --- Dailies ---
            addDaily: (title, type = 'GOLD') => set(state => ({
                dailies: [...state.dailies, { id: uuidv4(), title, completed: false, streak: 0, type }]
            })),
            toggleDaily: (id) => {
                const state = get();
                const daily = state.dailies.find(d => d.id === id);
                if (!daily) return;

                if (!daily.completed) {
                    get().gainXp(10);
                    get().addHeat(20, daily.type);

                    set(curr => ({
                        dailies: curr.dailies.map(d => d.id === id ? { ...d, completed: true, streak: d.streak + 1 } : d),
                        gold: curr.gold + 10
                    }));
                } else {
                    set(curr => ({
                        dailies: curr.dailies.map(d => d.id === id ? { ...d, completed: false, streak: Math.max(0, d.streak - 1) } : d)
                    }));
                }
            },
            deleteDaily: (id) => set(state => ({
                dailies: state.dailies.filter(d => d.id !== id)
            })),
        }),
        {
            name: 'dragon-keeper-v1', // localstorage name
            storage: createJSONStorage(() => localStorage),
        }
    )
);
