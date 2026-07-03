import { Text, View } from 'react-native';

type TagVariant = 'lime' | 'pastel-pink' | 'pastel-lilac' | 'pastel-sky' | 'pastel-mint' | 'amber' | 'surface';

interface TagProps {
  label: string;
  variant?: TagVariant;
}

const variantStyles: Record<TagVariant, { container: string; text: string }> = {
  lime: {
    container: 'bg-brand-lime rounded-pill px-3 py-1 self-start',
    text: 'font-heading text-[11px] text-brand-lime-ink',
  },
  'pastel-pink': {
    container: 'bg-pastel-pink rounded-pill px-3 py-1 self-start',
    text: 'font-heading text-[11px] text-pastel-pink-ink',
  },
  'pastel-lilac': {
    container: 'bg-pastel-lilac rounded-pill px-3 py-1 self-start',
    text: 'font-heading text-[11px] text-pastel-lilac-ink',
  },
  'pastel-sky': {
    container: 'bg-pastel-sky rounded-pill px-3 py-1 self-start',
    text: 'font-heading text-[11px] text-pastel-sky-ink',
  },
  'pastel-mint': {
    container: 'bg-pastel-mint rounded-pill px-3 py-1 self-start',
    text: 'font-heading text-[11px] text-pastel-mint-ink',
  },
  amber: {
    container: 'bg-accent-amber rounded-pill px-3 py-1 self-start',
    text: 'font-heading text-[11px] text-ink',
  },
  surface: {
    container: 'bg-surface rounded-pill px-3 py-1 self-start',
    text: 'font-heading text-[11px] text-ink-muted',
  },
};

export function Tag({ label, variant = 'lime' }: TagProps) {
  const styles = variantStyles[variant];
  return (
    <View className={styles.container}>
      <Text className={styles.text}>{label}</Text>
    </View>
  );
}
