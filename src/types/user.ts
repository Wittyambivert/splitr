export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  groups: string[];
  createdAt: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
