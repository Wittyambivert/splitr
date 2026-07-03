import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

type CardVariant = 'hero' | 'blob' | 'elevated';

interface CardProps extends ComponentProps<typeof View> {
  variant?: CardVariant;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  hero: 'rounded-xl bg-surface p-5 gap-3 overflow-hidden',
  blob: 'rounded-xl p-5 gap-3 items-center overflow-hidden',
  elevated: 'rounded-xl bg-surface p-5 gap-3 shadow-[0_8px_16px_rgba(21,19,22,0.06)]',
};

export function Card({ variant = 'hero', children, className = '', style, ...props }: CardProps) {
  return (
    <View className={`${variantStyles[variant]} ${className}`} style={style} {...props}>
      {children}
    </View>
  );
}
