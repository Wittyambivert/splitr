import type { User } from './user';

export type SplitType = 'equal' | 'itemised' | 'percentage' | 'custom';

export type ExpenseCategory =
  | 'food'
  | 'drinks'
  | 'transport'
  | 'utilities'
  | 'rent'
  | 'entertainment'
  | 'shopping'
  | 'other';

export interface OcrItem {
  name: string;
  price: number;
  quantity: number;
  confidence: number;
  assignedTo: string[];
  category: ExpenseCategory | null;
}

export interface ExpenseSplit {
  uid: string;
  amount: number;
  percentage?: number;
  items?: string[];
}

export interface Expense {
  expenseId: string;
  groupId: string;
  title: string;
  totalAmount: number;
  currency: string;
  category: ExpenseCategory;
  paidBy: string;
  splits: ExpenseSplit[];
  splitType: SplitType;
  receiptImageUrl: string | null;
  ocrItems: OcrItem[];
  createdAt: number;
  locked: boolean;
  notes: string | null;
}

export interface ExpenseWithPaidBy extends Expense {
  paidByUser: User;
}
