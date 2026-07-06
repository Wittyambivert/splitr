export interface VirtualCard {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export function getVirtualCard(): VirtualCard {
  return {
    cardNumber: '**** **** **** 1234',
    expiry: '12/28',
    cvv: '***',
  };
}
