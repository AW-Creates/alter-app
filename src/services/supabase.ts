import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { LearningJourney } from '../types/alter';

const STORAGE_SUPABASE_URL = 'altor_supabase_url';
const STORAGE_SUPABASE_KEY = 'altor_supabase_anon_key';

export const getStoredSupabaseUrl = (): string => {
  return localStorage.getItem(STORAGE_SUPABASE_URL) || (import.meta as any).env?.VITE_SUPABASE_URL || '';
};

export const getStoredSupabaseAnonKey = (): string => {
  return localStorage.getItem(STORAGE_SUPABASE_KEY) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
};

export const setStoredSupabaseConfig = (url: string, anonKey: string): void => {
  if (url && anonKey) {
    localStorage.setItem(STORAGE_SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_SUPABASE_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_SUPABASE_URL);
    localStorage.removeItem(STORAGE_SUPABASE_KEY);
  }
  supabaseInstance = null; // reset client
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const url = getStoredSupabaseUrl();
  const key = getStoredSupabaseAnonKey();

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }
  return null;
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(getStoredSupabaseUrl() && getStoredSupabaseAnonKey());
};

/**
 * Cloud Sync Service: Save all user learning journeys to Supabase PostgreSQL
 */
export async function syncJourneysToCloud(userId: string, journeys: LearningJourney[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !userId) return false;

  try {
    const { error } = await supabase
      .from('user_journeys')
      .upsert({
        user_id: userId,
        journeys_data: journeys,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.warn('Cloud sync upsert notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Cloud sync failed:', err);
    return false;
  }
}

/**
 * Fetch journeys from Cloud on login
 */
export async function fetchJourneysFromCloud(userId: string): Promise<LearningJourney[] | null> {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_journeys')
      .select('journeys_data')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data.journeys_data as LearningJourney[];
  } catch (err) {
    console.warn('Failed to fetch journeys from cloud:', err);
    return null;
  }
}

/**
 * Create a public shareable web link for a curriculum / journey
 */
export async function publishJourneyPublicly(journey: LearningJourney, authorName: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const shareSlug = `${journey.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from('public_journeys')
      .insert({
        slug: shareSlug,
        title: journey.title,
        topic: journey.topic,
        destination: journey.destination,
        author_name: authorName,
        journey_data: journey,
        created_at: new Date().toISOString()
      })
      .select('slug')
      .single();

    if (error || !data) return null;
    return `${window.location.origin}/#share=${data.slug}`;
  } catch (err) {
    console.warn('Publish journey failed:', err);
    return null;
  }
}
