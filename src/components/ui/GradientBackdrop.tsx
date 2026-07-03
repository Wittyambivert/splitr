import { LinearGradient } from 'expo-linear-gradient';
import { gradientStops } from '@/theme/colors';

interface GradientBackdropProps {
  variant?: 'frame' | 'card-blue' | 'card-warm';
  opacity?: number;
}

const stops: Record<string, { start: string; end: string }> = {
  frame: gradientStops.frame,
  'card-blue': gradientStops['card-blue'],
  'card-warm': gradientStops['card-warm'],
};

export function GradientBackdrop({ variant = 'frame', opacity = 0.35 }: GradientBackdropProps) {
  const colors = stops[variant];

  return (
    <LinearGradient
      colors={[colors.start, colors.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity }}
    />
  );
}
