import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { GradientBackdrop, Card, Tag, StatDisplay, IconCircle } from '@/components/ui';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <GradientBackdrop variant="frame" opacity={0.35} />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="font-body text-[28px] leading-[34px] text-ink">
              Get your <Text className="font-display">split</Text>
            </Text>
            <Text className="font-body text-[28px] leading-[34px] text-ink">
              Swipe <Text className="font-display">to settle</Text>
            </Text>
          </View>
          <IconCircle icon={Plus} variant="surface" accessibilityLabel="Add expense" onPress={() => router.push('/expense/new')} />
        </View>

        <StatDisplay value="$0" label="Net balance" badgeLabel="Settled" />

        <View className="mt-8 mb-4">
          <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide mb-3">
            Your Groups
          </Text>
          <Card variant="hero">
            <Tag label="No groups yet" variant="surface" />
            <Text className="font-heading text-[17px] leading-[22px] text-ink mt-2">
              Create your first group to start splitting expenses
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
