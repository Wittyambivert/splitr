import { useCallback, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/services/supabase';
import { useExpenseStore } from '@/stores';
import type { Expense, ExpenseSplit } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

const PAGE_SIZE = 20;
const MOCK_UID = 'mock-user-1';

export function useExpenses(groupId: string) {
  const { expenses, isLoading, setExpenses, addExpense, updateExpense, removeExpense, setLoading, setError } =
    useExpenseStore();
  const groupExpenses = expenses[groupId] ?? [];
  const channelRef = useRef<RealtimeChannel | null>(null);

  const subscribeToExpenses = useCallback(() => {
    if (!groupId) return;

    const supabase = getSupabaseClient();
    setLoading(true);

    supabase
      .from('expenses')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          return;
        }

        const mapped = (data ?? []).map(mapExpense);
        setExpenses(groupId, mapped);
      });

    channelRef.current = supabase
      .channel(`expenses-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            addExpense(groupId, mapExpense(payload.new as Record<string, unknown>));
          } else if (payload.eventType === 'UPDATE') {
            const e = payload.new as Record<string, unknown>;
            updateExpense(groupId, e.id as string, mapExpenseData(e));
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as Record<string, unknown>;
            removeExpense(groupId, old.id as string);
          }
        },
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [groupId, setExpenses, addExpense, updateExpense, removeExpense, setLoading, setError]);

  useEffect(() => {
    const cleanup = subscribeToExpenses();
    return () => cleanup?.();
  }, [subscribeToExpenses]);

  const createExpense = useCallback(
    async (expenseData: Omit<Expense, 'expenseId' | 'createdAt'>) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          group_id: groupId,
          title: expenseData.title,
          total_amount: expenseData.totalAmount,
          currency: expenseData.currency,
          category: expenseData.category,
          paid_by: expenseData.paidBy,
          split_type: expenseData.splitType,
          splits: expenseData.splits,
          receipt_image_url: expenseData.receiptImageUrl,
          ocr_items: expenseData.ocrItems,
          locked: expenseData.locked,
          notes: expenseData.notes,
          created_by: MOCK_UID,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id as string;
    },
    [groupId],
  );

  const removeExpenseFromGroup = useCallback(
    async (expenseId: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;
      removeExpense(groupId, expenseId);
    },
    [groupId, removeExpense],
  );

  return { expenses: groupExpenses, isLoading, subscribeToExpenses, createExpense, removeExpense: removeExpenseFromGroup };
}

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    expenseId: row.id as string,
    groupId: row.group_id as string,
    title: row.title as string,
    totalAmount: row.total_amount as number,
    currency: (row.currency as string) ?? 'USD',
    category: (row.category as Expense['category']) ?? 'other',
    paidBy: row.paid_by as string,
    splits: (row.splits as ExpenseSplit[]) ?? [],
    splitType: (row.split_type as Expense['splitType']) ?? 'equal',
    receiptImageUrl: (row.receipt_image_url as string | null) ?? null,
    ocrItems: (row.ocr_items as Expense['ocrItems']) ?? [],
    createdAt: new Date(row.created_at as string).getTime(),
    locked: (row.locked as boolean) ?? false,
    notes: (row.notes as string | null) ?? null,
  };
}

function mapExpenseData(row: Record<string, unknown>): Partial<Expense> {
  return {
    title: row.title as string,
    totalAmount: row.total_amount as number,
    category: row.category as Expense['category'],
    splits: row.splits as ExpenseSplit[],
    receiptImageUrl: row.receipt_image_url as string | null,
    ocrItems: row.ocr_items as Expense['ocrItems'],
    locked: row.locked as boolean,
    notes: row.notes as string | null,
  };
}
