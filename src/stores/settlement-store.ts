import { create } from 'zustand';
import type { Settlement } from '@/types';

interface SettlementState {
  settlements: Record<string, Settlement[]>;
  isLoading: boolean;
  error: string | null;
}

interface SettlementStore extends SettlementState {
  setSettlements: (groupId: string, settlements: Settlement[]) => void;
  addSettlement: (groupId: string, settlement: Settlement) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: SettlementState = {
  settlements: {},
  isLoading: false,
  error: null,
};

export const useSettlementStore = create<SettlementStore>((set) => ({
  ...initialState,
  setSettlements: (groupId, settlements) =>
    set((state) => ({
      settlements: { ...state.settlements, [groupId]: settlements },
      isLoading: false,
    })),
  addSettlement: (groupId, settlement) =>
    set((state) => ({
      settlements: {
        ...state.settlements,
        [groupId]: [...(state.settlements[groupId] ?? []), settlement],
      },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
