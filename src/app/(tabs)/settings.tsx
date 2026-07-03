import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, LogOut, CreditCard, Bell, DollarSign, Shield } from 'lucide-react-native';
import { Card, ListRow } from '@/components/ui';
import { useAuth } from '@/hooks';

const SETTINGS_ITEMS = [
  { icon: CreditCard, label: 'Payment Methods', route: 'payment-methods' },
  { icon: Bell, label: 'Notifications', route: 'notifications' },
  { icon: DollarSign, label: 'Currency', route: 'currency' },
  { icon: Shield, label: 'Privacy', route: 'privacy' },
];

export default function SettingsScreen() {
  const { user, isAuthenticated } = useAuth();

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 px-5" edges={['top']}>
        <Text className="font-heading text-xl text-ink mb-6 pt-5">Settings</Text>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="hero" className="items-center py-6">
            <View className="w-16 h-16 rounded-pill bg-pastel-lilac items-center justify-center mb-3">
              <Text className="font-display text-2xl text-pastel-lilac-ink">
                {user?.displayName?.charAt(0) ?? 'U'}
              </Text>
            </View>
            <Text className="font-heading text-[17px] text-ink">{user?.displayName ?? 'User'}</Text>
            <Text className="text-sm text-ink-muted">{user?.email ?? ''}</Text>
          </Card>

          <Card variant="hero" className="gap-0 p-0 overflow-hidden">
            {SETTINGS_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.route}
                  className={`flex-row items-center px-5 py-4 ${
                    index < SETTINGS_ITEMS.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <Icon size={20} color="#151316" />
                  <Text className="flex-1 font-medium text-[15px] text-ink ml-3">
                    {item.label}
                  </Text>
                  <ChevronRight size={18} color="#8A8791" />
                </Pressable>
              );
            })}
          </Card>

          <Pressable className="flex-row items-center px-5 py-4">
            <LogOut size={20} color="#E2554B" />
            <Text className="font-medium text-[15px] text-danger ml-3">Sign Out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
