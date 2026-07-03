import type { ComponentType } from 'react';
import { Pressable, View } from 'react-native';

interface IconCircleProps {
  icon: ComponentType<{ size: number; color: string }>;
  variant?: 'surface' | 'black';
  size?: number;
  iconSize?: number;
  onPress?: () => void;
  accessibilityLabel: string;
}

export function IconCircle({
  icon: Icon,
  variant = 'surface',
  size = 44,
  iconSize = 20,
  onPress,
  accessibilityLabel,
}: IconCircleProps) {
  const bgClass = variant === 'black' ? 'bg-surface-black' : 'bg-surface';
  const iconColor = variant === 'black' ? '#FFFFFF' : '#151316';

  const content = (
    <View
      className={`${bgClass} rounded-pill items-center justify-center`}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize} color={iconColor} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
