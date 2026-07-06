import { useCallback, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/services/supabase';
import { MOCK_UID, getMockMemberIds, generateLocalId } from '@/services/mock-data';
import { useAuthStore, useGroupStore } from '@/stores';
import type { Group } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

const DEFAULT_MOCK_MEMBER_IDS = getMockMemberIds();

function useCurrentUserId(): string {
  const authedUser = useAuthStore((s) => s.user);
  const supabase = getSupabaseClient();
  if (supabase && authedUser) return authedUser.uid;
  return MOCK_UID;
}

export function useGroups() {
  const { groups, isLoading, setGroups, addGroup, updateGroup, removeGroup, setLoading, setError } =
    useGroupStore();
  const currentUserId = useCurrentUserId();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const subscribeToGroups = useCallback(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      if (groups.length === 0) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', currentUserId)
      .then(async ({ data: memberships, error: membershipError }) => {
        if (membershipError) {
          setError(membershipError.message);
          return;
        }

        const groupIds = memberships?.map((m) => m.group_id) ?? [];

        if (groupIds.length === 0) {
          setGroups([]);
          return;
        }

        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds)
          .order('created_at', { ascending: false });

        if (groupsError) {
          setError(groupsError.message);
          return;
        }

        const mapped = (groupsData ?? []).map((g) => ({
          groupId: g.id,
          name: g.name,
          members: g.member_ids ?? [],
          createdBy: g.created_by,
          createdAt: new Date(g.created_at).getTime(),
          currency: g.currency ?? 'USD',
        }));
        setGroups(mapped);
      });

    channelRef.current = supabase
      .channel('groups-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const g = payload.new as Record<string, unknown>;
            addGroup({
              groupId: g.id as string,
              name: g.name as string,
              members: (g.member_ids as string[]) ?? [],
              createdBy: g.created_by as string,
              createdAt: new Date(g.created_at as string).getTime(),
              currency: (g.currency as string) ?? 'USD',
            });
          } else if (payload.eventType === 'UPDATE') {
            const g = payload.new as Record<string, unknown>;
            updateGroup(g.id as string, {
              name: g.name as string,
              members: (g.member_ids as string[]) ?? [],
              currency: (g.currency as string) ?? 'USD',
            });
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as Record<string, unknown>;
            removeGroup(old.id as string);
          }
        },
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [groups.length, currentUserId, setGroups, addGroup, updateGroup, removeGroup, setLoading, setError]);

  useEffect(() => {
    const cleanup = subscribeToGroups();
    return () => cleanup?.();
  }, [subscribeToGroups]);

  const createGroup = useCallback(
    async (name: string, memberIds: string[], currency: string = 'USD') => {
      const supabase = getSupabaseClient();
      const uid = currentUserId;
      const allMembers = [uid, ...memberIds.filter((id) => id !== uid)];
      const defaultMembers = memberIds.length === 0 ? DEFAULT_MOCK_MEMBER_IDS : allMembers;

      if (!supabase) {
        const localId = generateLocalId();
        const group: Group = {
          groupId: localId,
          name,
          members: defaultMembers,
          createdBy: uid,
          createdAt: Date.now(),
          currency,
        };
        addGroup(group);
        return localId;
      }

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          member_ids: allMembers,
          created_by: uid,
          currency,
        })
        .select('id')
        .single();

      if (error) throw error;

      const memberRows = allMembers.map((mUid) => ({
        group_id: data.id,
        user_id: mUid,
      }));

      const { error: memberError } = await supabase.from('group_members').insert(memberRows);
      if (memberError) throw memberError;

      return data.id as string;
    },
    [addGroup, currentUserId],
  );

  const deleteGroup = useCallback(
    async (groupId: string) => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('groups').delete().eq('id', groupId);
        if (error) throw error;
      }
      removeGroup(groupId);
    },
    [removeGroup],
  );

  return { groups, isLoading, subscribeToGroups, createGroup, deleteGroup };
}
