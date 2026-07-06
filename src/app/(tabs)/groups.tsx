import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import { Card, Tag, ListRow, IconCircle } from '@/components/ui';

const SAMPLE_GROUPS = [
  { id: '1', name: 'Flat 4', memberCount: 4, balance: '₦120,000' },
  { id: '2', name: 'Ibiza Trip', memberCount: 6, balance: '₦450,000' },
];

export default function GroupsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-heading text-xl text-ink">Groups</Text>
          <IconCircle icon={Plus} variant="surface" accessibilityLabel="Create group" onPress={() => router.push('/expense/new')} />
        </View>

        <View className="gap-3">
          {SAMPLE_GROUPS.map((group) => (
            <Pressable key={group.id} onPress={() => router.push({ pathname: '/group/[id]' as any, params: { id: group.id } })}>
              <Card variant="hero" className="flex-row items-center">
                <View className="w-12 h-12 rounded-pill bg-pastel-lilac items-center justify-center">
                  <Users size={22} color="#5B4A9E" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="font-heading text-[17px] text-ink">{group.name}</Text>
                  <Text className="text-sm text-ink-muted">{group.memberCount} members</Text>
                </View>
                <View className="items-end">
                  <Text className="font-display text-xl text-ink">{group.balance}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
