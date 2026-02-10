import { create } from 'zustand';

type SoundType =
    | 'CLICK'
    | 'HOVER'
    | 'SUCCESS'
    | 'ERROR'
    | 'LEVEL_UP'
    | 'MENU_OPEN'
    | 'EQUIP'
    | 'QUEST_COMPLETE'
    | 'HATCH'
    | 'ATTACK'
    | 'DAMAGE'
    | 'VICTORY'
    | 'DEFEAT'
    | 'CHIRP'
    | 'BOSS_SPAWN'
    | 'PHASE_CHANGE'
    | 'ATTACK_CHARGE'
    | 'ATTACK_HIT'
    | 'ATTACK_BLOCKED'
    | 'EATING';

interface SoundState {
    isPlaying: boolean;
    volume: number;
    playSound: (type: SoundType) => void;
    toggleSound: () => void;
}

// Preload Sounds
const audioCache: Partial<Record<SoundType, HTMLAudioElement>> = {};

const loadSound = (key: SoundType, url: string) => {
    const audio = new Audio(url);
    audio.preload = 'auto'; // Preload
    audioCache[key] = audio;
};

// Mixkit Assets (Free for use)
if (typeof window !== 'undefined') {
    loadSound('CLICK', 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'); // Pop
    loadSound('HOVER', 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'); // Soft Pop
    loadSound('SUCCESS', 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'); // Coin
    loadSound('ERROR', 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'); // Error
    loadSound('LEVEL_UP', 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); // Victory Intro
    loadSound('QUEST_COMPLETE', 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    loadSound('HATCH', 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'); // Magic Chime
    loadSound('ATTACK', 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3'); // Sword Hit
    loadSound('DAMAGE', 'https://assets.mixkit.co/active_storage/sfx/214/214-preview.mp3'); // Hit
    loadSound('VICTORY', 'https://assets.mixkit.co/active_storage/sfx/1431/1431-preview.mp3'); // Win Music
    loadSound('DEFEAT', 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'); // Lose Tone
    loadSound('CHIRP', 'https://assets.mixkit.co/active_storage/sfx/99/99-preview.mp3'); // Creature
    loadSound('EATING', 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'); // Reuse Soft Pop/Crunch

    // Encounter Sounds
    loadSound('BOSS_SPAWN', 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'); // Deep Boom (Reuse Hatch for now)
    loadSound('PHASE_CHANGE', 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'); // Magic
    loadSound('ATTACK_CHARGE', 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'); // Charge
    loadSound('ATTACK_HIT', 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3'); // Hit
    loadSound('ATTACK_BLOCKED', 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'); // Clank
}

export const useSound = create<SoundState>((set, get) => ({
    isPlaying: true, // Default on
    volume: 0.5,
    playSound: (type) => {
        const { isPlaying, volume } = get();
        if (!isPlaying) return;

        const audio = audioCache[type];
        if (audio) {
            audio.currentTime = 0;
            audio.volume = volume;
            audio.play().catch(e => {
                // Ignore auto-play errors (interaction needed)
                if (e.name !== 'NotAllowedError') console.warn('Sound play error', e);
            });
        }
    },
    toggleSound: () => set(state => ({ isPlaying: !state.isPlaying })),
}));
