import type { GroupMember } from '@/types';

export interface MockUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: null;
}

export const MOCK_UID = 'mock-user-1';

export const MOCK_USER: MockUser = {
  uid: MOCK_UID,
  displayName: 'You',
  email: 'you@splitr.app',
  photoURL: null,
};

export const MOCK_MEMBERS: MockUser[] = [
  MOCK_USER,
  { uid: 'mock-user-2', displayName: 'Alice Chen', email: 'alice@splitr.app', photoURL: null },
  { uid: 'mock-user-3', displayName: 'Bob Rivera', email: 'bob@splitr.app', photoURL: null },
  { uid: 'mock-user-4', displayName: 'Cara Diaz', email: 'cara@splitr.app', photoURL: null },
];

export function getMockMemberNames(): GroupMember[] {
  return MOCK_MEMBERS.map((m) => ({
    uid: m.uid,
    displayName: m.displayName,
    photoURL: m.photoURL,
    email: m.email,
  }));
}

export function getMockMemberIds(): string[] {
  return MOCK_MEMBERS.map((m) => m.uid);
}

export function getMemberDisplayName(uid: string): string {
  const member = MOCK_MEMBERS.find((m) => m.uid === uid);
  return member?.displayName ?? `Member ${uid.slice(-1)}`;
}

export function generateLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
