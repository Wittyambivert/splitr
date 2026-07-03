export interface Settlement {
  settlementId: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  settledAt: number | null;
  createdAt: number;
}

export interface SimplifiedDebt {
  from: string;
  to: string;
  amount: number;
}

export interface NetBalance {
  uid: string;
  displayName: string;
  netAmount: number;
}
