import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ScanLine, Equal, PieChart, SlidersHorizontal } from 'lucide-react-native';
import { Card, Tag, Button, IconCircle, SearchInput } from '@/components/ui';
import type { SplitType } from '@/types';

const SPLIT_OPTIONS: { type: SplitType; icon: typeof Equal; label: string }[] = [
  { type: 'equal', icon: Equal, label: 'Equal' },
  { type: 'percentage', icon: PieChart, label: 'Percentage' },
  { type: 'custom', icon: SlidersHorizontal, label: 'Custom' },
];

export default function NewExpenseScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');

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
          <Text className="flex-1 font-heading text-[17px] text-ink text-center mr-11">
            Add Expense
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card variant="hero" className="gap-4">
            <SearchInput
              variant="light"
              placeholder="What was the expense for?"
              value={title}
              onChangeText={setTitle}
            />

            <View className="bg-canvas-alt rounded-md px-4 py-3">
              <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide mb-1">
                Amount
              </Text>
              <TextInput
                className="font-display text-[32px] text-ink"
                placeholder="0.00"
                placeholderTextColor="#B7B4BE"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </Card>

          <Card variant="hero">
            <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide mb-3">
              Split Type
            </Text>
            <View className="flex-row gap-3">
              {SPLIT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = splitType === opt.type;
                return (
                  <Pressable
                    key={opt.type}
                    className={`flex-1 items-center py-3 rounded-md gap-1 ${
                      isActive ? 'bg-brand-lime' : 'bg-canvas-alt'
                    }`}
                    onPress={() => setSplitType(opt.type)}
                  >
                    <Icon size={18} color={isActive ? '#173300' : '#8A8791'} />
                    <Text
                      className={`font-heading text-[11px] ${
                        isActive ? 'text-brand-lime-ink' : 'text-ink-muted'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card variant="hero">
            <Text className="text-xs text-ink-muted font-heading uppercase tracking-wide mb-3">
              Split with
            </Text>
            <Tag label="Split equally" variant="pastel-mint" />
          </Card>

          <Button
            variant="primary"
            icon={<ScanLine size={20} color="#173300" />}
            label="Scan Receipt"
            onPress={() => router.push('/(tabs)/scan')}
          />

          <Pressable className="bg-surface-black rounded-pill h-14 items-center justify-center active:opacity-80">
            <Text className="font-heading text-[15px] text-surface">Create Expense</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
