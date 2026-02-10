import { supabase, isSyncConfigured } from './supabaseClient';
import { useDragonStore } from './dragonStore';

// GameBackup interface removed

export const syncService = {
    // Save current state to Supabase
    uploadSave: async () => {
        if (!isSyncConfigured()) return { error: "Supabase not configured." };

        const state = useDragonStore.getState();
        const jsonState = JSON.stringify(state);

        try {
            const { error } = await supabase!
                .from('dragon_saves')
                .upsert({
                    id: 'player-1', // Shared slot for now
                    game_state: jsonState,
                    updated_at: new Date().toISOString()
                });

            return { error };
        } catch (e: any) {
            return { error: e.message };
        }
    },

    // Load state from Supabase
    downloadSave: async () => {
        if (!isSyncConfigured()) return { error: "Supabase not configured." };

        try {
            const { data, error } = await supabase!
                .from('dragon_saves')
                .select('game_state')
                .eq('id', 'player-1')
                .single();

            if (error) return { error };
            if (data) {
                // HYDRATE STORE
                const parsedState = JSON.parse(data.game_state);
                useDragonStore.setState(parsedState);
                return { success: true };
            }
            return { error: "No save found." };
        } catch (e: any) {
            return { error: e.message };
        }
    }
};
