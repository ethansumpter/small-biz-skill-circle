import { useColorScheme } from 'react-native';

/** Bond semantic colour tokens — see docs/bond-brand-kit.md. Use these in UI code. */
const light = {
  surface: '#F0F3F5',
  surfaceRaised: '#FFFFFF',
  ink: '#544A63',
  inkMuted: '#6B6378',
  accent: '#A2B2D8',
  onAccent: '#2E2838',
  link: '#4A5A8A',
  focusRing: '#4A5A8A',
  line: '#D5D9E2',
};

const dark: typeof light = {
  surface: '#231E2B',
  surfaceRaised: '#544A63',
  ink: '#F0F3F5',
  inkMuted: '#C6C2D0',
  accent: '#A2B2D8',
  onAccent: '#2E2838',
  link: '#A2B2D8',
  focusRing: '#A2B2D8',
  line: '#3D3549',
};

export type BondColors = typeof light;

/** Brand palette — use directly only for marketing/illustration and fixed brand elements. */
export const brand = {
  platinum: '#F0F3F5',
  vintageGrape: '#544A63',
  powderBlue: '#A2B2D8',
  navy: '#212445',
  grapeDeep: '#2E2838',
};

export function useBondColors(): BondColors {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 12: 48 } as const;

export const radius = { sm: 6, md: 12, full: 999 } as const;

export const fonts = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold',
} as const;
