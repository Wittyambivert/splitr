import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';

interface NavTab {
  key: string;
  icon: ComponentType<{ size: number; color: string }>;
  label?: string;
  isCta?: boolean;
}

interface BottomNavProps {
  tabs: NavTab[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function BottomNav({ tabs, activeTab, onTabPress }: BottomNavProps) {
  return (
    <View className="absolute bottom-4 left-5 right-5 h-16 bg-surface-black rounded-pill flex-row items-center justify-between px-3 shadow-[0_10px_20px_rgba(21,19,22,0.25)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === activeTab;

        if (tab.isCta) {
          return (
            <Pressable
              key={tab.key}
              className="bg-brand-lime rounded-pill h-12 px-4 flex-row items-center gap-1.5 -translate-y-1"
              onPress={() => onTabPress(tab.key)}
              accessibilityRole="button"
              accessibilityLabel={tab.label ?? tab.key}
            >
              <Icon size={18} color="#173300" />
              {tab.label && (
                <Text className="font-heading text-[13px] text-brand-lime-ink">
                  {tab.label}
                </Text>
              )}
            </Pressable>
          );
        }

        return (
          <Pressable
            key={tab.key}
            className="w-12 h-12 rounded-pill items-center justify-center"
            onPress={() => onTabPress(tab.key)}
            accessibilityRole="button"
            accessibilityLabel={tab.label ?? tab.key}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon size={22} color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} />
          </Pressable>
        );
      })}
    </View>
  );
}
