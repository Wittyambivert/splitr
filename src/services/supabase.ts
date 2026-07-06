import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

let client: SupabaseClient | null = null;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase credentials not found.\n\n' +
      'Create a .env file in the project root with:\n' +
      '  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
      '  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n' +
      'See .env.example for reference.',
    );
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
