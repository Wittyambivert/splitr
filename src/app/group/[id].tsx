import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Users, Plus, MoreVertical, Hand, Check } from 'lucide-react-native';
import { Card, Tag, ListRow, StatDisplay, IconCircle, GradientBackdrop, Button } from '@/components/ui';
import { formatCurrency, simplifyDebts, calculateNetBalancesForMembers } from '@/utils';

const SAMPLE_MEMBERS = [
  { uid: '1', displayName: 'You', photoURL: null, email: 'you@email.com' },
  { uid: '2', displayName: 'Alex Chen', photoURL: null, email: 'alex@email.com' },
  { uid: '3', displayName: 'Sam Wilson', photoURL: null, email: 'sam@email.com' },
];

const SAMPLE_EXPENSES = [
  {
    expenseId: '1',
    title: 'Dinner at Sushi Bar',
    totalAmount: 89.50,
    paidBy: '1',
    splits: [
      { uid: '1', amount: 29.83 },
      { uid: '2', amount: 29.83 },
      { uid: '3', amount: 29.83 },
    ],
    createdAt: Date.now() - 86400000,
  },
];

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const memberNames = new Map(SAMPLE_MEMBERS.map((m) => [m.uid, m.displayName]));

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
            <Text className="font-heading text-[17px] text-ink">Flat 4</Text>
            <Text className="text-sm text-ink-muted">3 members</Text>
          </View>
          <IconCircle icon={MoreVertical} variant="surface" accessibilityLabel="Menu" />
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ gap: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="blob" className="bg-accent-violet/10">
            <View className="w-14 h-14 rounded-pill bg-accent-violet items-center justify-center -mt-8">
              <Check size={24} color="#FFFFFF" />
            </View>
            <Text className="font-heading text-[17px] text-ink">Settle Up</Text>
            <Text className="text-sm text-ink-muted text-center">
              2 payments needed to settle all balances
            </Text>
            <Button variant="primary" label="Settle Up" onPress={() => {}} />
          </Card>

          <Card variant="hero" className="bg-gradient-card-warm">
            <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide">
              Net Balances
            </Text>
            {SAMPLE_MEMBERS.map((member) => (
              <View key={member.uid} className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-pill bg-pastel-pink items-center justify-center">
                    <Text className="font-heading text-[11px] text-pastel-pink-ink">
                      {member.displayName.charAt(0)}
                    </Text>
                  </View>
                  <Text className="font-medium text-[15px] text-ink">{member.displayName}</Text>
                </View>
                <Text className={`font-display text-base ${member.uid === '1' ? 'text-success' : 'text-danger'}`}>
                  {member.uid === '1' ? '+$29.84' : '-$14.92'}
                </Text>
              </View>
            ))}
          </Card>

          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide">
              Expenses
            </Text>
            <IconCircle icon={Plus} variant="surface" size={36} iconSize={16} accessibilityLabel="Add expense" onPress={() => router.push('/expense/new')} />
          </View>

          {SAMPLE_EXPENSES.map((expense) => (
            <Card key={expense.expenseId} variant="hero">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-heading text-[17px] text-ink">{expense.title}</Text>
                  <Text className="text-sm text-ink-muted">
                    Paid by {memberNames.get(expense.paidBy)}
                  </Text>
                </View>
                <Text className="font-display text-lg text-ink">
                  {formatCurrency(expense.totalAmount)}
                </Text>
              </View>
              <View className="flex-row gap-2 mt-2">
                <Tag label="Equal" variant="pastel-mint" />
              </View>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
