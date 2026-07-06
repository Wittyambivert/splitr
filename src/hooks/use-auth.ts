import { useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { MOCK_USER } from '@/services/mock-data';

export function useAuth() {
  const { user, isLoading, error, setUser } = useAuthStore();

  useEffect(() => {
    if (!user) {
      setUser({
        uid: MOCK_USER.uid,
        displayName: MOCK_USER.displayName,
        email: MOCK_USER.email,
        photoURL: MOCK_USER.photoURL,
        groups: [],
        createdAt: Date.now(),
      });
    }
  }, [user, setUser]);

  return {
    user,
    isLoading: isLoading && !user,
    error,
    isAuthenticated: true,
  };
}
