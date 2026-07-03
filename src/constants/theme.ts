import { Platform } from 'react-native';
import { palette, spacing, radius, typeScale, fontFamily } from '@/theme';

export const Colors = {
  light: {
    text: palette.ink,
    background: palette.canvas,
    backgroundElement: palette['canvas-alt'],
    backgroundSelected: palette.line,
    textSecondary: palette['ink-muted'],
  },
  dark: {
    text: palette.surface,
    background: palette['surface-black'],
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: fontFamily.body,
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: fontFamily.mono,
  },
  default: {
    sans: fontFamily.body,
    serif: 'serif',
    rounded: 'normal',
    mono: fontFamily.mono,
  },
  web: {
    sans: 'var(--font-body)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: spacing[1],
  two: spacing[2],
  three: spacing[4],
  four: spacing[6],
  five: spacing[8],
  six: spacing[12],
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
