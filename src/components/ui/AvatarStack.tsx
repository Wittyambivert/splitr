import { Text, View } from 'react-native';
import { getInitials } from '@/utils';

interface AvatarItem {
  uri?: string | null;
  name: string;
}

interface AvatarStackProps {
  avatars: AvatarItem[];
  max?: number;
  size?: number;
}

export function AvatarStack({ avatars, max = 4, size = 36 }: AvatarStackProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <View className="flex-row items-center">
      {visible.map((avatar, index) => (
        <View
          key={index}
          className="rounded-pill bg-canvas-alt items-center justify-center border-2 border-surface"
          style={{
            width: size,
            height: size,
            marginLeft: index === 0 ? 0 : -8,
            zIndex: visible.length - index,
          }}
        >
          <Text className="font-heading text-[11px] text-ink-muted">
            {getInitials(avatar.name)}
          </Text>
        </View>
      ))}
      {overflow > 0 && (
        <View
          className="rounded-pill bg-ink items-center justify-center border-2 border-surface"
          style={{
            width: size,
            height: size,
            marginLeft: -8,
          }}
        >
          <Text className="font-heading text-[11px] text-surface">
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}
