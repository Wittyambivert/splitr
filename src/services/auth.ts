import { getSupabaseClient } from './supabase';
import type { User } from '@/types';
import { useAuthStore } from '@/stores';

function mapSupabaseUser(sbUser: { id: string; email?: string | null; user_metadata?: { full_name?: string; avatar_url?: string | null } }): User {
  return {
    uid: sbUser.id,
    displayName: sbUser.user_metadata?.full_name ?? sbUser.email?.split('@')[0] ?? 'User',
    email: sbUser.email ?? '',
    photoURL: sbUser.user_metadata?.avatar_url ?? null,
    groups: [],
    createdAt: Date.now(),
  };
}

export async function signUp(email: string, password: string, displayName: string): Promise<User> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: displayName } },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign-up failed');

  const user = mapSupabaseUser(data.user);
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.uid,
    display_name: displayName,
    email: user.email,
    photo_url: user.photoURL,
  });

  if (profileError) throw profileError;
  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign-in failed');
  return mapSupabaseUser(data.user);
}

export async function signOutUser(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  useAuthStore.getState().reset();
}

export function subscribeToAuthChanges(): () => void {
  const supabase = getSupabaseClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    const store = useAuthStore.getState();

    if (session?.user) {
      const supabaseClient = getSupabaseClient();
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const user: User = profile
        ? {
            uid: profile.id,
            displayName: profile.display_name,
            email: profile.email,
            photoURL: profile.photo_url,
            groups: profile.group_ids ?? [],
            createdAt: new Date(profile.created_at).getTime(),
          }
        : mapSupabaseUser(session.user);

      store.setUser(user);
    } else {
      store.setUser(null);
    }
  });

  return () => subscription.unsubscribe();
}
