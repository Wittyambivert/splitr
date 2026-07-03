import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ListRowProps {
  leftIcon: ReactNode;
  label: string;
  right?: ReactNode;
  onPress?: () => void;
}

export function ListRow({ leftIcon, label, right, onPress }: ListRowProps) {
  const content = (
    <View className="flex-row items-center bg-canvas-alt rounded-md px-4 py-3.5 gap-3">
      <View className="w-11 h-11 rounded-pill items-center justify-center">
        {leftIcon}
      </View>
      <Text className="flex-1 font-medium text-[15px] text-ink" numberOfLines={1}>
        {label}
      </Text>
      {right && <View>{right}</View>}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
        {content}
      </Pressable>
    );
  }

  return content;
}
