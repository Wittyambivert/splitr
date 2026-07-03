const MOCK_USER = {
  uid: 'mock-user-1',
  displayName: 'You',
  email: 'you@splitr.app',
  photoURL: null,
  groups: [],
  createdAt: Date.now(),
};

export function useAuth() {
  return { user: MOCK_USER, isLoading: false, error: null, isAuthenticated: true };
}
