import type { ExpenseSplit, SplitType } from '@/types';

interface SplitInput {
  totalAmount: number;
  memberIds: string[];
  splitType: SplitType;
  percentages?: Record<string, number>;
  itemAmounts?: Record<string, number>;
}

function roundToTwo(n: number): number {
  return Math.round(n * 100) / 100;
}

function distributeRemainder(splits: ExpenseSplit[], remainder: number): ExpenseSplit[] {
  if (Math.abs(remainder) < 0.01) return splits;
  const sorted = [...splits].sort((a, b) => b.amount - a.amount);
  sorted[0].amount = roundToTwo(sorted[0].amount + remainder);
  return splits;
}

export function calculateEqualSplit({ totalAmount, memberIds }: SplitInput): ExpenseSplit[] {
  if (memberIds.length === 0) return [];
  const raw = totalAmount / memberIds.length;
  const base = roundToTwo(raw);
  const splits: ExpenseSplit[] = memberIds.map((uid) => ({
    uid,
    amount: base,
  }));
  const total = splits.reduce((sum, s) => sum + s.amount, 0);
  const remainder = roundToTwo(totalAmount - total);
  return distributeRemainder(splits, remainder);
}

export function calculatePercentageSplit({
  totalAmount,
  memberIds,
  percentages = {},
}: SplitInput): ExpenseSplit[] {
  const splits: ExpenseSplit[] = memberIds.map((uid) => {
    const pct = percentages[uid] ?? 0;
    return {
      uid,
      amount: roundToTwo(totalAmount * (pct / 100)),
      percentage: pct,
    };
  });
  const total = splits.reduce((sum, s) => sum + s.amount, 0);
  const remainder = roundToTwo(totalAmount - total);
  return distributeRemainder(splits, remainder);
}

export function calculateCustomSplit({
  totalAmount,
  memberIds,
  itemAmounts = {},
}: SplitInput): ExpenseSplit[] {
  const splits: ExpenseSplit[] = memberIds.map((uid) => ({
    uid,
    amount: roundToTwo(itemAmounts[uid] ?? 0),
  }));
  return splits;
}

export function calculateSplit(input: SplitInput): ExpenseSplit[] {
  switch (input.splitType) {
    case 'equal':
      return calculateEqualSplit(input);
    case 'percentage':
      return calculatePercentageSplit(input);
    case 'custom':
    case 'itemised':
      return calculateCustomSplit(input);
    default:
      return calculateEqualSplit(input);
  }
}
