import { Platform } from 'react-native';

export const fontFamily = Platform.select({
  ios: {
    display: 'PlusJakartaSans-ExtraBold',
    heading: 'PlusJakartaSans-Bold',
    body: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    mono: 'SpaceMono-Regular',
  },
  android: {
    display: 'PlusJakartaSans-ExtraBold',
    heading: 'PlusJakartaSans-Bold',
    body: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    mono: 'SpaceMono-Regular',
  },
  default: {
    display: 'PlusJakartaSans-ExtraBold',
    heading: 'PlusJakartaSans-Bold',
    body: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    mono: 'SpaceMono-Regular',
  },
  web: {
    display: 'var(--font-display)',
    heading: 'var(--font-heading)',
    body: 'var(--font-body)',
    medium: 'var(--font-medium)',
    mono: 'var(--font-mono)',
  },
});

export const typeScale = {
  display: { fontSize: 56, lineHeight: 60, fontFamily: fontFamily.display },
  h1: { fontSize: 28, lineHeight: 34 },
  h2: { fontSize: 20, lineHeight: 26, fontFamily: fontFamily.heading },
  h3: { fontSize: 17, lineHeight: 22, fontFamily: fontFamily.heading },
  body: { fontSize: 15, lineHeight: 21, fontFamily: fontFamily.medium },
  'body-muted': { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.heading, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  badge: { fontSize: 11, lineHeight: 14, fontFamily: fontFamily.heading },
} as const;
