
import { createClient } from '@supabase/supabase-js';

// These will be populated by the user in the new Settings UI OR via Environment Variables (Vercel)
const SUPABASE_URL = localStorage.getItem('dragon-supabase-url') || import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = localStorage.getItem('dragon-supabase-key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

// Helper to check if configured
export const isSyncConfigured = () => !!supabase;

export const signInWithGoogle = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
            scopes: 'https://www.googleapis.com/auth/calendar'
        },
    });
    if (error) throw error;
    return data;
};
