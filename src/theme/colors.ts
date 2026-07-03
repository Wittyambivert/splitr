export const palette = {
  canvas: '#F2F0F5',
  'canvas-alt': '#EDEBF2',
  ink: '#151316',
  'ink-muted': '#8A8791',
  'ink-faint': '#B7B4BE',
  surface: '#FFFFFF',
  'surface-black': '#0B0A0D',
  line: '#E4E1EA',

  'brand-lime': '#C6F24E',
  'brand-lime-ink': '#173300',
  'accent-amber': '#F4C430',
  'accent-violet': '#8B7BD8',
  'accent-blush': '#F3B7C3',

  'pastel-pink': '#F6CBD3',
  'pastel-pink-ink': '#B4425A',
  'pastel-lilac': '#DCD1F4',
  'pastel-lilac-ink': '#5B4A9E',
  'pastel-sky': '#CFE6F9',
  'pastel-sky-ink': '#2E6B96',
  'pastel-mint': '#D6F5D0',
  'pastel-mint-ink': '#2E7D42',

  success: '#2E7D42',
  warning: '#F4C430',
  danger: '#E2554B',
  info: '#8B7BD8',

  overlay: 'rgba(11, 10, 13, 0.55)',
} as const;

export const gradientStops = {
  frame: { start: '#C9A9E9', end: '#F2B9C4' },
  'card-blue': { start: '#BFE0F7', end: '#E7F3FB' },
  'card-warm': { start: '#F9D7B0', end: '#FBC1C7' },
} as const;

export const shadows = {
  card: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  floating: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
