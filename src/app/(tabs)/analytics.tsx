import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackdrop, Card, Tag, StatDisplay } from '@/components/ui';

const CATEGORIES = [
  { name: 'Food', amount: 340_000, color: 'bg-pastel-mint', percentage: 45 },
  { name: 'Transport', amount: 120_000, color: 'bg-pastel-sky', percentage: 20 },
  { name: 'Utilities', amount: 180_000, color: 'bg-pastel-lilac', percentage: 25 },
  { name: 'Extras', amount: 60_000, color: 'bg-pastel-pink', percentage: 10 },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const total = CATEGORIES.reduce((s, c) => s + c.amount, 0);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-heading text-xl text-ink mb-6">Analytics</Text>

        <View className="gap-4">
          <Card variant="hero">
            <StatDisplay value={`₦${total.toLocaleString()}`} label="Total spending" />
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
                    <Text className="font-medium text-lg text-ink">₦{cat.amount.toLocaleString()}</Text>
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
        </View>
      </ScrollView>
    </View>
  );
}
