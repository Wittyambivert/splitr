import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Menu, Plus, Search, Users } from 'lucide-react-native';
import { Card, IconCircle, Button, BottomSheet } from '@/components/ui';
import { useAuth, useGroups } from '@/hooks';
import { signOutUser } from '@/services';
import { isSupabaseConfigured } from '@/services';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { groups, isLoading, createGroup } = useGroups();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('Group 1');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    const trimmed = groupName.trim();
    if (!trimmed) return;
    setCreating(true);
    setCreateError(null);
    try {
      const groupId = await createGroup(trimmed, []);
      setShowCreateModal(false);
      setGroupName('Group 1');
      setCreateError(null);
      router.push({ pathname: '/group/[id]', params: { id: groupId } });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCreateModal = () => {
    setGroupName('Group 1');
    setCreateError(null);
    setShowCreateModal(true);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOutUser();
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  const showSignOut = isSupabaseConfigured();

  const displayName = user?.displayName ?? 'User';

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="font-body text-[13px] leading-[18px] text-ink-muted">Welcome back</Text>
            <Text className="font-heading text-[17px] leading-[22px] text-ink">{displayName}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <IconCircle icon={Search} variant="surface" accessibilityLabel="Search" onPress={() => {}} />
            {showSignOut ? (
              <IconCircle icon={Menu} variant="surface" accessibilityLabel="Sign out" onPress={handleSignOut} />
            ) : (
              <IconCircle icon={Menu} variant="surface" accessibilityLabel="Menu" onPress={() => {}} />
            )}
          </View>
        </View>

        <View className="mb-6">
          <Text className="font-body text-[28px] leading-[34px] text-ink">
            Get your <Text className="font-display">split</Text>
          </Text>
          <Text className="font-body text-[28px] leading-[34px] text-ink">
            Swipe <Text className="font-display">to settle</Text>
          </Text>
        </View>

        <View className="flex-row items-start mb-10">
          <Text className="font-display text-[56px] leading-[60px] text-ink">{groups.length}</Text>
          <View className="bg-accent-amber rounded-pill px-2.5 py-1 rotate-[-6deg] mt-2 ml-1">
            <Text className="font-heading text-[10px] text-ink">Groups</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide mb-3">Your Groups</Text>
          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#C6F24E" />
            </View>
          ) : groups.length === 0 ? (
            <Card variant="hero" className="items-center py-8 gap-2">
              <View className="w-12 h-12 rounded-pill bg-canvas-alt items-center justify-center">
                <Users size={22} color="#8A8791" />
              </View>
              <Text className="font-heading text-[17px] text-ink">No groups yet</Text>
              <Text className="text-sm text-ink-muted text-center">Create your first group to start splitting bills</Text>
            </Card>
          ) : (
            <View className="gap-3">
              {groups.map((group) => (
                <Pressable
                  key={group.groupId}
                  onPress={() => router.push({ pathname: '/group/[id]', params: { id: group.groupId } })}
                >
                  <Card variant="hero" className="flex-row items-center">
                    <View className="w-12 h-12 rounded-pill bg-pastel-lilac items-center justify-center">
                      <Users size={22} color="#5B4A9E" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="font-heading text-[17px] text-ink">{group.name}</Text>
                      <Text className="text-sm text-ink-muted">{group.members.length} members</Text>
                    </View>
                    <Plus size={18} color="#8A8791" />
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable
          className="flex-row items-center rounded-xl bg-surface p-5 gap-3 border border-dashed border-line active:opacity-80"
          onPress={handleOpenCreateModal}
          accessibilityRole="button"
          accessibilityLabel="Create new group"
        >
          <View className="w-12 h-12 rounded-pill bg-canvas-alt items-center justify-center">
            <Plus size={22} color="#8A8791" />
          </View>
          <Text className="flex-1 font-heading text-[17px] text-ink-muted">Create new group</Text>
          <Plus size={18} color="#8A8791" />
        </Pressable>
      </ScrollView>

      <BottomSheet visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <View className="px-5 gap-6">
          <Text className="font-heading text-xl text-white">Create Group</Text>
          <View className="bg-surface-black border border-brand-lime rounded-pill h-14 px-5 justify-center">
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              className="text-white text-[15px] font-medium"
              autoFocus
              selectTextOnFocus
            />
          </View>
          {createError !== null ? (
            <Text className="text-danger text-sm font-medium">{createError}</Text>
          ) : null}
          <Button
            variant="primary"
            label={creating ? 'Creating...' : 'Create'}
            onPress={handleCreateGroup}
            disabled={creating || !groupName.trim()}
          />
        </View>
      </BottomSheet>
    </View>
  );
}
