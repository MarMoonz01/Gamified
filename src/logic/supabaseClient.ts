
import { createClient } from '@supabase/supabase-js';

// These will be populated by the user in the new Settings UI
const SUPABASE_URL = localStorage.getItem('dragon-supabase-url') || '';
const SUPABASE_KEY = localStorage.getItem('dragon-supabase-key') || '';

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

// Helper to check if configured
export const isSyncConfigured = () => !!supabase;
