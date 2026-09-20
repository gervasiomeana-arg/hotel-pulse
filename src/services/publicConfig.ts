// Supabase publishable credentials are intentionally client-visible.
// Authorization is enforced by PostgreSQL Row Level Security, never by this key.
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://ixmsjdqkqdemrkgeukhx.supabase.co';

export const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  'sb_publishable_f3aCwaKhfq4lLL1gcXWhSw_pLuomEY3';

export const publicSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
