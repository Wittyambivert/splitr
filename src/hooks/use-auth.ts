import { useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { MOCK_USER } from '@/services/mock-data';
import { isSupabaseConfigured } from '@/services';

export function useAuth() {
  const { user, isLoading, error, setUser } = useAuthStore();
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseConfigured && !user) {
      setUser({
        uid: MOCK_USER.uid,
        displayName: MOCK_USER.displayName,
        email: MOCK_USER.email,
        photoURL: MOCK_USER.photoURL,
        groups: [],
        createdAt: Date.now(),
      });
    }
  }, [user, setUser, supabaseConfigured]);

  return {
    user,
    isLoading: !supabaseConfigured ? false : isLoading,
    error,
    isAuthenticated: !supabaseConfigured || user !== null,
  };
}
