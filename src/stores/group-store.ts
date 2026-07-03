import { create } from 'zustand';
import type { Group } from '@/types';

interface GroupState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
}

interface GroupStore extends GroupState {
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  removeGroup: (groupId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: GroupState = {
  groups: [],
  isLoading: false,
  error: null,
};

export const useGroupStore = create<GroupStore>((set) => ({
  ...initialState,
  setGroups: (groups) => set({ groups, isLoading: false }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (groupId, updates) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.groupId === groupId ? { ...g, ...updates } : g)),
    })),
  removeGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.groupId !== groupId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
