/**
 * Debt Simplification Algorithm
 *
 * Calculates the minimum number of transactions needed to settle all debts
 * within a group using a greedy approach: net balance per person, then
 * match max creditor with max debtor iteratively.
 *
 * This is a **core feature** — do not rewrite without explicit instruction.
 */

import type { Expense, ExpenseSplit, SimplifiedDebt, NetBalance } from '@/types';

interface BalanceEntry {
  uid: string;
  displayName: string;
  balance: number;
}

function calculateNetBalances(
  expenses: Expense[],
  memberDisplayNames: Map<string, string>,
): BalanceEntry[] {
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    const paidBy = expense.paidBy;
    const currentPaid = balances.get(paidBy) ?? 0;
    balances.set(paidBy, currentPaid + expense.totalAmount);

    for (const split of expense.splits) {
      const currentOwed = balances.get(split.uid) ?? 0;
      balances.set(split.uid, currentOwed - split.amount);
    }
  }

  return Array.from(balances.entries())
    .filter(([_, balance]) => balance !== 0)
    .map(([uid, balance]) => ({
      uid,
      displayName: memberDisplayNames.get(uid) ?? uid,
      balance,
    }))
    .sort((a, b) => b.balance - a.balance);
}

export function simplifyDebts(
  expenses: Expense[],
  memberDisplayNames: Map<string, string>,
): SimplifiedDebt[] {
  const balances = calculateNetBalances(expenses, memberDisplayNames);
  const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b, balance: -b.balance }));
  const creditors = balances.filter((b) => b.balance > 0);
  const transactions: SimplifiedDebt[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.balance, creditor.balance);
    const roundedAmount = roundAmount(amount);

    if (roundedAmount > 0.01) {
      transactions.push({
        from: debtor.uid,
        to: creditor.uid,
        amount: roundedAmount,
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }

  return transactions;
}

export function calculateNetBalancesForMembers(
  expenses: Expense[],
  memberDisplayNames: Map<string, string>,
): NetBalance[] {
  const balances = calculateNetBalances(expenses, memberDisplayNames);
  return balances.map((b) => ({
    uid: b.uid,
    displayName: b.displayName,
    netAmount: b.balance,
  }));
}

function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}
