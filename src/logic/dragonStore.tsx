import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';


// --- Types ---

export type DragonType = 'ARCANE' | 'TERRA' | 'WIND' | 'FIRE' | 'WATER' | 'RADIANT';
export type DragonStage = 'EGG' | 'BABY' | 'JUVENILE' | 'ADULT' | 'ELDER';
export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

import { generateDragonName, generateDragonDNA } from './DragonGenetics';
import type { DragonDNA } from './DragonGenetics';

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

export interface HeroStats {
    strength: number;
    agility: number;
    sense: number;
    vitality: number;
    intelligence: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    level: number;
    xp: number;
    rank: Rank;
    availablePoints: number;
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

    hero: HeroStats;

    // Entities
    dragons: Dragon[];
    activeEgg: Egg | null;
    habits: Habit[];
    tasks: Task[]; // Now treated as "Dungeons" / Todos
    dailies: Daily[];
    dragonInk: number;
    collectedCards: OracleCard[];

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
    addVocab: (word: string, meaning: string, type: VocabWord['type']) => void;
    practiceVocab: (id: string, success: boolean) => void;

    // --- Oracle Deck ---
    unlockCard: (card: OracleCard) => void;
    modifyInk: (amount: number) => void;

    // --- Player Stats ---
    gainXp: (amount: number) => void;
    takeDamage: (amount: number) => void;
    restoreHp: (amount: number) => void;
    restoreMp: (amount: number) => void;
    spendMp: (amount: number) => boolean;
    allocatePoint: (stat: keyof HeroStats) => void;

    // --- Dailies ---
    addDaily: (title: string, type?: Daily['type']) => void;
    toggleDaily: (id: string) => void;
    deleteDaily: (id: string) => void;
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
    mastery: number; // 0 (New) -> 5 (Mastered)
    lastPracticed: number;
}

export const useDragonStore = create<DragonState>()(
    persist(
        (set, get) => ({
            // Resources
            essence: 50,
            gold: 100,

            // Player Profile
            playerName: "Dragon Keeper",

            // Entities
            dragons: [],
            vocabList: [], // Init empty
            dragonInk: 0,
            collectedCards: [],
            summonCharge: 0,

            hero: {
                strength: 10, agility: 10, sense: 10, vitality: 10, intelligence: 10,
                hp: 100, maxHp: 100, mp: 50, maxMp: 50,
                level: 1, xp: 0, rank: 'E', availablePoints: 0
            },

            activeEgg: {
                id: 'initial-egg',
                rarity: 'COMMON',
                heat: 0,
                requiredHeat: 500,
                isReadyToHatch: false,
                history: {
                    study: 0, health: 0, social: 0, gold: 0,
                    reading: 0, listening: 0, writing: 0, speaking: 0
                }
            },
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
            },

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
                set(state => {
                    const habit = state.habits.find(h => h.id === id);
                    if (!habit) return state;

                    if (habit.type !== 'BOTH') get().addHeat(10, habit.type);

                    return {
                        ...state,
                        essence: state.essence + 5,
                        habits: state.habits.map(h => h.id === id ? { ...h, streak: h.streak + 1, value: h.value + (direction === 'UP' ? 1 : -1) } : h)
                    };
                });
            },

            deleteHabit: (id) => set(state => ({
                habits: state.habits.filter(h => h.id !== id)
            })),

            addTask: (title, type, rank = 'E', description, expiresAt) => set(state => ({
                tasks: [...state.tasks, { id: uuidv4(), title, completed: false, type, rank, description, expiresAt }]
            })),

            lastResetDate: new Date().toISOString().split('T')[0],

            resetDailies: () => set(state => ({
                // Clear scheduled items (those with expiresAt) and reset daily completion
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
                set(state => {
                    const task = state.tasks.find(t => t.id === id);
                    if (!task) return state;

                    // If completing, give rewards
                    if (!task.completed) {
                        get().addHeat(50, task.type); // +50 Heat
                        return {
                            ...state,
                            gold: state.gold + 20, // +20 Gold
                            tasks: state.tasks.map(t => t.id === id ? { ...t, completed: true } : t)
                        };
                    } else {
                        // Unchecking (Development only usually, but allowed)
                        return {
                            ...state,
                            tasks: state.tasks.map(t => t.id === id ? { ...t, completed: false } : t)
                        };
                    }
                });
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

            addVocab: (word, meaning, type) => set(state => ({
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
            })),

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

            // --- Hero Stats Logic ---
            gainXp: (amount) => set(state => {
                let newXp = state.hero.xp + amount;
                let newLevel = state.hero.level;
                let points = state.hero.availablePoints;
                let maxMp = state.hero.maxMp;
                let hp = state.hero.hp;

                if (newXp >= 100 * state.hero.level) {
                    newXp -= 100 * state.hero.level;
                    newLevel += 1;
                    points += 3;
                    maxMp += 10;
                    hp = state.hero.maxHp; // Heal on level up
                }
                return {
                    hero: { ...state.hero, xp: newXp, level: newLevel, availablePoints: points, maxMp, hp }
                };
            }),
            takeDamage: (amount) => set(state => ({
                hero: { ...state.hero, hp: Math.max(0, state.hero.hp - amount) }
            })),
            restoreHp: (amount) => set(state => ({
                hero: { ...state.hero, hp: Math.min(state.hero.maxHp, state.hero.hp + amount) }
            })),
            restoreMp: (amount) => set(state => ({
                hero: { ...state.hero, mp: Math.min(state.hero.maxMp, state.hero.mp + amount) }
            })),
            spendMp: (amount) => {
                const state = get();
                if (state.hero.mp >= amount) {
                    set({ hero: { ...state.hero, mp: state.hero.mp - amount } });
                    return true;
                }
                return false;
            },
            allocatePoint: (stat) => set(state => {
                if (state.hero.availablePoints > 0 && typeof state.hero[stat] === 'number') {
                    return {
                        hero: {
                            ...state.hero,
                            [stat]: (state.hero[stat] as number) + 1,
                            availablePoints: state.hero.availablePoints - 1
                        }
                    };
                }
                return state;
            }),

            // --- Dailies ---
            addDaily: (title, type = 'GOLD') => set(state => ({
                dailies: [...state.dailies, { id: uuidv4(), title, completed: false, streak: 0, type }]
            })),
            toggleDaily: (id) => set(state => {
                const daily = state.dailies.find(d => d.id === id);
                if (!daily) return state;

                if (!daily.completed) {
                    get().gainXp(10);
                    get().restoreMp(10);
                    get().addHeat(20, daily.type);
                    return {
                        dailies: state.dailies.map(d => d.id === id ? { ...d, completed: true, streak: d.streak + 1 } : d),
                        gold: state.gold + 10
                    };
                } else {
                    return {
                        dailies: state.dailies.map(d => d.id === id ? { ...d, completed: false, streak: Math.max(0, d.streak - 1) } : d)
                    };
                }
            }),
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
