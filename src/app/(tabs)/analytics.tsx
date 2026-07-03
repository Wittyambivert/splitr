import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackdrop, Card, Tag, StatDisplay } from '@/components/ui';

const CATEGORIES = [
  { name: 'Food', amount: 340, color: 'bg-pastel-mint', percentage: 45 },
  { name: 'Transport', amount: 120, color: 'bg-pastel-sky', percentage: 20 },
  { name: 'Utilities', amount: 180, color: 'bg-pastel-lilac', percentage: 25 },
  { name: 'Extras', amount: 60, color: 'bg-pastel-pink', percentage: 10 },
];

export default function AnalyticsScreen() {
  const total = CATEGORIES.reduce((s, c) => s + c.amount, 0);

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 px-5" edges={['top']}>
        <Text className="font-heading text-xl text-ink mb-6 pt-5">Analytics</Text>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="hero">
            <StatDisplay value={`$${total}`} label="Total spending" />
          </Card>

          <Card variant="hero">
            <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide mb-4">
              By category
            </Text>
            <View className="gap-3">
              {CATEGORIES.map((cat) => (
                <View key={cat.name}>
                  <View className="flex-row justify-between mb-1">
                    <Text className="font-medium text-[15px] text-ink">{cat.name}</Text>
                    <Text className="font-medium text-[15px] text-ink">${cat.amount}</Text>
                  </View>
                  <View className="h-2 rounded-pill bg-canvas-alt overflow-hidden">
                    <View
                      className={`h-full rounded-pill ${cat.color}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </Card>

          <Card variant="hero">
            <Tag label="Coming soon" variant="pastel-lilac" />
            <Text className="font-heading text-[17px] text-ink mt-2">
              Monthly trends & export
            </Text>
            <Text className="text-sm text-ink-muted">
              CSV and PDF export will be available in the next update
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
