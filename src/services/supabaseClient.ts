import { createClient } from '@supabase/supabase-js';
import { publicSupabaseConfigured, supabasePublishableKey, supabaseUrl } from './publicConfig';

export const supabaseConfigured = publicSupabaseConfigured;

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
