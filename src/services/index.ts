export { getSupabaseClient, isSupabaseConfigured } from './supabase';
export { signUp, signIn, signInWithGoogle, signOutUser, subscribeToAuthChanges } from './auth';
export { scanReceipt, getConfidenceLabel } from './ocr';
export type { OcrResult, OcrStatus } from './ocr';
export { sendPaymentReminder } from './notifications';
export { getVirtualCard } from './nomba';
export type { VirtualCard } from './nomba';
export { MOCK_UID, MOCK_USER, MOCK_MEMBERS, getMockMemberNames, getMockMemberIds, getMemberDisplayName, generateLocalId } from './mock-data';
export type { MockUser } from './mock-data';
