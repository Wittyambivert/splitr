import { useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
  startAfter,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/services';
import { useExpenseStore, useAuthStore } from '@/stores';
import type { Expense } from '@/types';

const PAGE_SIZE = 20;

export function useExpenses(groupId: string) {
  const { expenses, isLoading, setExpenses, addExpense, updateExpense, removeExpense, setLoading, setError } =
    useExpenseStore();
  const user = useAuthStore((state) => state.user);
  const groupExpenses = expenses[groupId] ?? [];

  const subscribeToExpenses = useCallback(() => {
    if (!groupId) return () => {};

    const db = getFirestoreDb();
    const q = query(
      collection(db, 'groups', groupId, 'expenses'),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expensesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          expenseId: doc.id,
        })) as Expense[];
        setExpenses(groupId, expensesData);
      },
      (err) => {
        setError(err.message);
      },
    );

    return unsubscribe;
  }, [groupId, setExpenses, setError]);

  const createExpense = useCallback(
    async (expenseData: Omit<Expense, 'expenseId' | 'createdAt'>) => {
      if (!user?.uid) throw new Error('Not authenticated');

      const db = getFirestoreDb();
      const docRef = await addDoc(collection(db, 'groups', groupId, 'expenses'), {
        ...expenseData,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    },
    [groupId, user?.uid],
  );

  const editExpense = useCallback(
    async (expenseId: string, updates: Partial<Expense>) => {
      const db = getFirestoreDb();
      await updateDoc(doc(db, 'groups', groupId, 'expenses', expenseId), updates);
      updateExpense(groupId, expenseId, updates);
    },
    [groupId, updateExpense],
  );

  const removeExpenseFromGroup = useCallback(
    async (expenseId: string) => {
      const db = getFirestoreDb();
      await deleteDoc(doc(db, 'groups', groupId, 'expenses', expenseId));
      removeExpense(groupId, expenseId);
    },
    [groupId, removeExpense],
  );

  return {
    expenses: groupExpenses,
    isLoading,
    subscribeToExpenses,
    createExpense,
    editExpense,
    removeExpense: removeExpenseFromGroup,
  };
}
