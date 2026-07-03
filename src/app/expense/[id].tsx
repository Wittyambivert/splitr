import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MoreVertical, Lock, Camera } from 'lucide-react-native';
import { Card, Tag, ListRow, IconCircle, Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row items-center px-5 py-3">
          <IconCircle
            icon={ArrowLeft}
            variant="surface"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
          <View className="flex-1 ml-3">
            <Text className="font-heading text-[17px] text-ink">Expense Detail</Text>
          </View>
          <IconCircle icon={MoreVertical} variant="surface" accessibilityLabel="Menu" />
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="hero" className="items-center py-6">
            <Text className="font-display text-[40px] text-ink">
              {formatCurrency(89.50)}
            </Text>
            <Text className="font-heading text-[17px] text-ink mt-1">Dinner at Sushi Bar</Text>
            <View className="flex-row gap-2 mt-3">
              <Tag label="Food" variant="pastel-mint" />
              <Tag label="Equal split" variant="pastel-sky" />
            </View>
            <Text className="text-sm text-ink-muted mt-3">
              {formatDate(Date.now() - 86400000)}
            </Text>
          </Card>

          <Card variant="hero">
            <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide mb-3">
              Split Details
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center justify-between py-2">
                <Text className="font-medium text-[15px] text-ink">You</Text>
                <Text className="font-display text-lg text-success">+₦59.67</Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <Text className="font-medium text-[15px] text-ink">Alex Chen</Text>
                <Text className="font-display text-lg text-ink">₦29.83</Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <Text className="font-medium text-[15px] text-ink">Sam Wilson</Text>
                <Text className="font-display text-lg text-ink">₦29.83</Text>
              </View>
            </View>
          </Card>

          <Card variant="hero">
            <View className="flex-row items-center gap-2 mb-3">
              <Lock size={14} color="#8A8791" />
              <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide">
                Receipt
              </Text>
            </View>
            <View className="bg-canvas-alt rounded-md h-40 items-center justify-center">
              <Camera size={24} color="#8A8791" />
              <Text className="text-sm text-ink-muted mt-2">No receipt attached</Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
