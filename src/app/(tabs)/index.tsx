import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Menu, Camera } from 'lucide-react-native';
import { GradientBackdrop, Card, Tag, AvatarStack, IconCircle } from '@/components/ui';

const DEMO_AVATARS = [
  { name: 'Alice', uri: null, bgColor: '#F3B7C3' },
  { name: 'Bob', uri: null, bgColor: '#D6F5D0' },
  { name: 'Charlie', uri: null, bgColor: '#DCD1F4' },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <GradientBackdrop variant="frame" opacity={0.35} />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="font-body text-[13px] leading-[18px] text-ink-muted">
              Welcome back
            </Text>
            <Text className="font-heading text-[17px] leading-[22px] text-ink">
              Orbix Studio
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <IconCircle
              icon={Search}
              variant="surface"
              accessibilityLabel="Search"
              onPress={() => {}}
            />
            <IconCircle
              icon={Menu}
              variant="surface"
              accessibilityLabel="Menu"
              onPress={() => {}}
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="font-body text-[28px] leading-[34px] text-ink">
            Get your <Text className="font-display">tokens</Text>
          </Text>
          <Text className="font-body text-[28px] leading-[34px] text-ink">
            <Text className="font-display">Swipe</Text> to friends
          </Text>
        </View>

        <View className="flex-row justify-between items-start mb-8">
          <View className="items-start">
            <View className="flex-row items-start">
              <Text className="font-display text-[56px] leading-[60px] text-ink">
                24
              </Text>
              <View className="bg-accent-amber rounded-pill px-2.5 py-1 -rotate-6 mt-2 ml-1">
                <Text className="font-heading text-[10px] text-ink">Swiped</Text>
              </View>
            </View>
          </View>

          <View className="items-end mt-1">
            <Text className="text-[12px] text-ink-muted font-medium mb-2">
              Your Swiped group
            </Text>
            <AvatarStack avatars={DEMO_AVATARS} max={3} size={36} />
          </View>
        </View>

        <Card variant="hero" className="mb-4">
          <Text className="font-heading text-[22px] leading-[28px] text-ink">
            Strawberry{'\n'}Milkshake
          </Text>

          <View className="flex-row items-center gap-2 mt-1">
            <Tag label="Swipedrinks Festival" variant="pastel-pink" />
            <Text className="text-[12px] text-ink-muted">{'>'}</Text>
          </View>

          <View className="items-end mt-2">
            <View
              className="rounded-lg overflow-hidden bg-pastel-pink items-center justify-center"
              style={{ width: 150, height: 150 }}
            >
              <Text className="text-[48px]">🍓</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 mt-4">
            <Text className="font-heading text-[15px] text-ink">Swipe{'\n'}Now</Text>
            <View className="bg-surface-black rounded-pill w-12 h-12 items-center justify-center">
              <Camera size={20} color="#FFFFFF" />
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
