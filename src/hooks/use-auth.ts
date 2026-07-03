import { useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { subscribeToAuthChanges } from '@/services';

export function useAuth() {
  const { user, isLoading, error } = useAuthStore((state) => ({
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
  }));

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges();
    return unsubscribe;
  }, []);

  return { user, isLoading, error, isAuthenticated: !!user };
}
