import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

// Lexend is Bond's only typeface (react-app/docs/bond-brand-kit.md).
export const FONT = 'Lexend';

const weights = [
  ['400', 'Lexend_400Regular.ttf'],
  ['500', 'Lexend_500Medium.ttf'],
  ['600', 'Lexend_600SemiBold.ttf'],
  ['700', 'Lexend_700Bold.ttf'],
] as const;

export const fontsLoaded = Promise.all(
  weights.map(([weight, file]) => loadFont({ family: FONT, url: staticFile(`fonts/${file}`), weight })),
);
