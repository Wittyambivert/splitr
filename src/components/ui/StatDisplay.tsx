import { Text, View } from 'react-native';

interface StatDisplayProps {
  value: string;
  label: string;
  badgeLabel?: string;
}

export function StatDisplay({ value, label, badgeLabel }: StatDisplayProps) {
  return (
    <View className="items-start">
      <View className="flex-row items-start">
        <Text className="font-display text-[56px] leading-[60px] text-ink">
          {value}
        </Text>
        {badgeLabel && (
          <View className="bg-accent-amber rounded-pill px-2.5 py-1 -rotate-6 mt-2 ml-1">
            <Text className="font-heading text-[10px] text-ink">{badgeLabel}</Text>
          </View>
        )}
      </View>
      <Text className="text-xs text-ink-muted font-medium uppercase tracking-wide mt-1">
        {label}
      </Text>
    </View>
  );
}
