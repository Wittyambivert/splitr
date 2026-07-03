import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase';
import type { User } from '@/types';
import { useAuthStore } from '@/stores';

function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName ?? 'User',
    email: firebaseUser.email ?? '',
    photoURL: firebaseUser.photoURL,
    groups: [],
    createdAt: Date.now(),
  };
}

export async function signUp(email: string, password: string, displayName: string): Promise<User> {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const user = mapFirebaseUser(credential.user);
  await setDoc(doc(db, 'users', user.uid), {
    ...user,
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const db = getFirestoreDb();
  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

  if (userDoc.exists()) {
    return userDoc.data() as User;
  }

  return mapFirebaseUser(credential.user);
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
  useAuthStore.getState().reset();
}

export function subscribeToAuthChanges(): () => void {
  const auth = getFirebaseAuth();

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useAuthStore.getState();

    if (firebaseUser) {
      const db = getFirestoreDb();
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        store.setUser(userDoc.data() as User);
      } else {
        store.setUser(mapFirebaseUser(firebaseUser));
      }
    } else {
      store.setUser(null);
    }
  });

  return unsubscribe;
}
