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
} from 'firebase/firestore';
import { getFirestoreDb } from '@/services';
import { useGroupStore, useAuthStore } from '@/stores';
import type { Group } from '@/types';

export function useGroups() {
  const { groups, isLoading, setGroups, addGroup, updateGroup, removeGroup, setLoading, setError } = useGroupStore();
  const user = useAuthStore((state) => state.user);

  const subscribeToGroups = useCallback(() => {
    if (!user?.uid) return () => {};

    const db = getFirestoreDb();
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groupsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          groupId: doc.id,
        })) as Group[];
        setGroups(groupsData);
      },
      (err) => {
        setError(err.message);
      },
    );

    return unsubscribe;
  }, [user?.uid, setGroups, setError]);

  const createGroup = useCallback(
    async (name: string, members: string[], currency: string = 'USD') => {
      if (!user?.uid) throw new Error('Not authenticated');

      const db = getFirestoreDb();
      const allMembers = [...new Set([...members, user.uid])];

      const docRef = await addDoc(collection(db, 'groups'), {
        name,
        members: allMembers,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        currency,
      });

      return docRef.id;
    },
    [user?.uid],
  );

  const editGroup = useCallback(
    async (groupId: string, updates: Partial<Group>) => {
      const db = getFirestoreDb();
      await updateDoc(doc(db, 'groups', groupId), updates);
      updateGroup(groupId, updates);
    },
    [updateGroup],
  );

  const deleteGroup = useCallback(
    async (groupId: string) => {
      const db = getFirestoreDb();
      await deleteDoc(doc(db, 'groups', groupId));
      removeGroup(groupId);
    },
    [removeGroup],
  );

  return {
    groups,
    isLoading,
    subscribeToGroups,
    createGroup,
    editGroup,
    deleteGroup,
  };
}
