import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import { Card, Tag, ListRow, IconCircle, GradientBackdrop } from '@/components/ui';

const SAMPLE_GROUPS = [
  { id: '1', name: 'Flat 4', memberCount: 4, balance: '$120', currency: 'USD' },
  { id: '2', name: 'Ibiza Trip', memberCount: 6, balance: '$450', currency: 'EUR' },
];

export default function GroupsScreen() {
  return (
    <View className="flex-1 bg-canvas">
      <GradientBackdrop variant="frame" opacity={0.25} />
      <SafeAreaView className="flex-1 px-5" edges={['top']}>
        <View className="flex-row justify-between items-center mb-6 pt-5">
          <Text className="font-heading text-xl text-ink">Groups</Text>
          <IconCircle icon={Plus} variant="surface" accessibilityLabel="Create group" onPress={() => router.push('/expense/new')} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
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
                  <Text className="font-display text-lg text-ink">{group.balance}</Text>
                  <Text className="text-xs text-ink-muted">{group.currency}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
