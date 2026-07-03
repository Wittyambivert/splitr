import type { ComponentType } from 'react';
import { Tabs, usePathname } from 'expo-router';
import { Pressable, View, Text } from 'react-native';
import { ScanLine, Wallet, Bookmark, DollarSign, CreditCard } from 'lucide-react-native';

interface TabDef {
  name: string;
  icon: ComponentType<{ size: number; color: string }>;
  isCta?: boolean;
}

const tabs: TabDef[] = [
  { name: 'index', icon: Wallet },
  { name: 'groups', icon: Bookmark },
  { name: 'scan', icon: ScanLine, isCta: true },
  { name: 'analytics', icon: DollarSign },
  { name: 'settings', icon: CreditCard },
];

function CustomTabBar({ navigation }: { navigation: any }) {
  const pathname = usePathname();

  return (
    <View className="absolute bottom-4 left-5 right-5 h-16 bg-surface-black rounded-pill flex-row items-center justify-between px-3 shadow-[0_10px_20px_rgba(21,19,22,0.25)]">
      {tabs.map((tab) => {
        const tabRoute = tab.name === 'index' ? '/' : `/${tab.name}`;
        const isActive = pathname === tabRoute;

        if (tab.isCta) {
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.name}
              className="bg-brand-lime rounded-pill h-12 px-4 flex-row items-center gap-1.5 -translate-y-1"
              onPress={() => navigation.navigate('scan')}
              accessibilityRole="button"
              accessibilityLabel="Scan receipt"
            >
              <Icon size={18} color="#173300" />
              <Text className="font-heading text-[13px] text-brand-lime-ink">Scan</Text>
            </Pressable>
          );
        }

        const Icon = tab.icon;
        return (
          <Pressable
            key={tab.name}
            className="w-12 h-12 rounded-pill items-center justify-center"
            onPress={() => navigation.navigate(tab.name)}
            accessibilityRole="button"
            accessibilityLabel={tab.name}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon size={22} color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar navigation={props.navigation} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="groups" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
