import { useCallback, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/services/supabase';
import { useGroupStore } from '@/stores';
import type { Group } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

const MOCK_UID = 'mock-user-1';

export function useGroups() {
  const { groups, isLoading, setGroups, addGroup, updateGroup, removeGroup, setLoading, setError } =
    useGroupStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const subscribeToGroups = useCallback(() => {
    const supabase = getSupabaseClient();
    setLoading(true);

    supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', MOCK_UID)
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
  }, [setGroups, addGroup, updateGroup, removeGroup, setLoading, setError]);

  useEffect(() => {
    const cleanup = subscribeToGroups();
    return () => cleanup?.();
  }, [subscribeToGroups]);

  const createGroup = useCallback(
    async (name: string, memberIds: string[], currency: string = 'USD') => {
      const supabase = getSupabaseClient();
      const allMembers = [...new Set([...memberIds, MOCK_UID])];

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          member_ids: allMembers,
          created_by: MOCK_UID,
          currency,
        })
        .select('id')
        .single();

      if (error) throw error;

      const memberRows = allMembers.map((uid) => ({
        group_id: data.id,
        user_id: uid,
      }));

      const { error: memberError } = await supabase.from('group_members').insert(memberRows);
      if (memberError) throw memberError;

      return data.id as string;
    },
    [],
  );

  const deleteGroup = useCallback(
    async (groupId: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      if (error) throw error;
      removeGroup(groupId);
    },
    [removeGroup],
  );

  return { groups, isLoading, subscribeToGroups, createGroup, deleteGroup };
}
