import { Card, GradientBackdrop, IconCircle, Tag } from '@/components/ui';
import { ArrowRight, Menu, Plus, Search, Users } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SAMPLE_GROUPS = [
  { id: '1', name: 'Flat 4', memberCount: 4, balance: 120000.5 },
  { id: '2', name: 'Ibiza Trip', memberCount: 6, balance: -45000.0 },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className='flex-1 bg-canvas'>
      <GradientBackdrop variant='frame' opacity={0.35} />
      <ScrollView
        className='flex-1 px-5'
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className='flex-row justify-between items-center mb-8'>
          <View>
            <Text className='font-body text-[13px] leading-[18px] text-ink-muted'>
              Welcome back
            </Text>
            <Text className='font-heading text-[17px] leading-[22px] text-ink'>Orbix Studio</Text>
          </View>
          <View className='flex-row items-center gap-3'>
            <IconCircle
              icon={Search}
              variant='surface'
              accessibilityLabel='Search'
              onPress={() => {}}
            />
            <IconCircle
              icon={Menu}
              variant='surface'
              accessibilityLabel='Menu'
              onPress={() => {}}
            />
          </View>
        </View>

        <View className='mb-6'>
          <Text className='font-body text-[28px] leading-[34px] text-ink'>
            Get your <Text className='font-display'>split</Text>
          </Text>
          <Text className='font-body text-[28px] leading-[34px] text-ink'>
            Swipe <Text className='font-display'>to settle</Text>
          </Text>
        </View>

        <View className='flex-row items-start mb-10'>
          <Text className='font-display text-[56px] leading-[60px] text-ink'>₦7500.50</Text>
          <View className='bg-accent-amber rounded-pill px-2.5 py-1 -rotate-6 mt-2 ml-1'>
            <Text className='font-heading text-[10px] text-ink'>Owed</Text>
          </View>
        </View>

        <View className='mb-6'>
          <Text className='text-xs text-ink-muted font-heading uppercase tracking-wide mb-3'>
            Your Groups
          </Text>
          <View className='gap-3'>
            {SAMPLE_GROUPS.map((group) => (
              <Card key={group.id} variant='hero' className='flex-row items-center'>
                <View className='w-12 h-12 rounded-pill bg-pastel-lilac items-center justify-center'>
                  <Users size={22} color='#5B4A9E' />
                </View>
                <View className='flex-1 ml-3'>
                  <Text className='font-heading text-[17px] text-ink'>{group.name}</Text>
                  <Text className='text-sm text-ink-muted'>{group.memberCount} members</Text>
                </View>
                <View className='items-end'>
                  <Text className='font-display text-xl text-ink'>₦{Math.abs(group.balance)}</Text>
                  <Text
                    className={`text-xs font-medium ${group.balance >= 0 ? 'text-success' : 'text-danger'}`}
                  >
                    {group.balance >= 0 ? 'You are owed' : 'You owe'}
                  </Text>
                </View>
              </Card>
            ))}
            <Pressable className='flex-row items-center rounded-xl bg-surface p-5 gap-3 border border-dashed border-line active:opacity-80'>
              <View className='w-12 h-12 rounded-pill bg-canvas-alt items-center justify-center'>
                <Plus size={22} color='#8A8791' />
              </View>
              <Text className='flex-1 font-heading text-[17px] text-ink-muted'>
                Create new group
              </Text>
              <ArrowRight size={18} color='#8A8791' />
            </Pressable>
          </View>
        </View>

        <View>
          <Text className='text-xs text-ink-muted font-heading uppercase tracking-wide mb-3'>
            Recent Activity
          </Text>
          <Card variant='hero'>
            <View className='flex-row items-center gap-3'>
              <View className='w-10 h-10 rounded-pill bg-pastel-mint items-center justify-center'>
                <Text className='font-heading text-sm text-pastel-mint-ink'>F</Text>
              </View>
              <View className='flex-1'>
                <Text className='font-medium text-[15px] text-ink'>Dinner at Nobu</Text>
                <Text className='text-sm text-ink-muted'>Flat 4 • 2h ago</Text>
              </View>
              <Text className='font-display text-xl text-ink'>₦4200.50</Text>
            </View>
            <View className='flex-row items-center gap-2 mt-3'>
              <Tag label='Paid by you' variant='pastel-sky' />
              <Text className='text-sm text-ink-muted'>Split 3 ways</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
