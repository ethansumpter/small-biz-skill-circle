import { StyleSheet, Text, View } from 'react-native';

import { brand, radius, space, type } from '@/theme/tokens';

/**
 * The Bond wordmark used in the app header (no rings). Stand-in until the real
 * wordmark asset is added; swap this for the image then.
 * Always on a platinum tile — the logo is for light grounds only.
 */
export function BondLogo() {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="Bond" style={styles.tile}>
      <Text style={[type.heading, styles.wordmark]}>BOND</Text>
    </View>
  );
}

/** Two overlapping circles — Bond's "match" motif (used in the tab bar, not the header logo). */
export function RingsMark({ color, size, strokeWidth = 2 }: { color: string; size: number; strokeWidth?: number }) {
  const ring = { width: size, height: size, borderRadius: radius.full, borderWidth: strokeWidth, borderColor: color };
  return (
    <View style={styles.rings}>
      <View style={ring} />
      <View style={[ring, { marginLeft: -size * 0.35 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: brand.platinum,
    borderRadius: radius.sm,
    paddingHorizontal: space[2],
  },
  wordmark: { color: brand.navy, letterSpacing: 1 },
  rings: { flexDirection: 'row', alignItems: 'center' },
});
