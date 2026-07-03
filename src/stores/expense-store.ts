import { create } from 'zustand';
import type { Expense } from '@/types';

interface ExpenseState {
  expenses: Record<string, Expense[]>;
  isLoading: boolean;
  error: string | null;
}

interface ExpenseStore extends ExpenseState {
  setExpenses: (groupId: string, expenses: Expense[]) => void;
  addExpense: (groupId: string, expense: Expense) => void;
  updateExpense: (groupId: string, expenseId: string, updates: Partial<Expense>) => void;
  removeExpense: (groupId: string, expenseId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: ExpenseState = {
  expenses: {},
  isLoading: false,
  error: null,
};

export const useExpenseStore = create<ExpenseStore>((set) => ({
  ...initialState,
  setExpenses: (groupId, expenses) =>
    set((state) => ({
      expenses: { ...state.expenses, [groupId]: expenses },
      isLoading: false,
    })),
  addExpense: (groupId, expense) =>
    set((state) => ({
      expenses: {
        ...state.expenses,
        [groupId]: [...(state.expenses[groupId] ?? []), expense],
      },
    })),
  updateExpense: (groupId, expenseId, updates) =>
    set((state) => ({
      expenses: {
        ...state.expenses,
        [groupId]: (state.expenses[groupId] ?? []).map((e) =>
          e.expenseId === expenseId ? { ...e, ...updates } : e,
        ),
      },
    })),
  removeExpense: (groupId, expenseId) =>
    set((state) => ({
      expenses: {
        ...state.expenses,
        [groupId]: (state.expenses[groupId] ?? []).filter((e) => e.expenseId !== expenseId),
      },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
