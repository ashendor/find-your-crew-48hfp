import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ROLES } from '@/lib/crew-types';

let instance: SupabaseClient | null = null;

export function getCrewSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!instance) instance = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return instance;
}

export const CREW_ROLES = ROLES;
export const CREW_LOOKING_FOR = ['A film crew', 'Collaborators', 'Acting roles', 'Creative projects', 'Networking'] as const;
export const CREW_AVATAR_BUCKET = 'crew-avatars';
