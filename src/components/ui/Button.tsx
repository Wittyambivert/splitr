import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { palette } from '@/theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ComponentProps<typeof Pressable> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  label: string;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string; iconColor: string }> = {
  primary: {
    container: 'bg-brand-lime rounded-pill px-6 h-14 items-center justify-center flex-row gap-2 active:opacity-80',
    text: 'font-heading text-brand-lime-ink text-[15px]',
    iconColor: palette['brand-lime-ink'],
  },
  secondary: {
    container: 'bg-surface rounded-pill px-5 h-12 justify-center shadow-[0_8px_16px_rgba(21,19,22,0.06)] active:opacity-80 flex-row items-center gap-2',
    text: 'font-heading text-ink text-[15px]',
    iconColor: palette.ink,
  },
  ghost: {
    container: 'w-11 h-11 rounded-pill bg-surface items-center justify-center active:opacity-80',
    text: 'font-heading text-ink text-[15px]',
    iconColor: palette.ink,
  },
};

export function Button({ variant = 'primary', icon, label, className = '', style, ...props }: ButtonProps) {
  const styles = variantStyles[variant];

  if (variant === 'ghost' && icon) {
    return (
      <Pressable
        className={`${styles.container} ${className}`}
        style={style}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        {...props}
      >
        {icon}
      </Pressable>
    );
  }

  return (
    <Pressable
      className={`${styles.container} ${className}`}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...props}
    >
      {icon && <View>{icon}</View>}
      <Text className={styles.text}>{label}</Text>
    </Pressable>
  );
}
