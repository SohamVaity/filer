import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim() || '';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://');

if (isSupabaseConfigured) {
  console.log('Supabase configured:', supabaseUrl);
} else {
  console.warn('Supabase not configured. Auth features will be disabled.');
  console.warn('Create a .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export { isSupabaseConfigured };
