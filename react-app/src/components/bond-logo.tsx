import { StyleSheet, Text, View } from 'react-native';

import { brand, radius, space, type } from '@/theme/tokens';

/**
 * Stand-in for the Bond logo (wordmark + two overlapping rings) until the real
 * bond-logo.png / bond-mark.png assets are added. Swap this for the image then;
 * the brand kit says not to redraw the logo.
 * Always on a platinum tile — the logo is for light grounds only.
 */
export function BondLogo() {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="Bond" style={styles.tile}>
      <Text style={[type.heading, styles.wordmark]}>BOND</Text>
      <RingsMark color={brand.navy} size={18} />
    </View>
  );
}

/** Two overlapping circles — Bond's "match" motif. */
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: brand.platinum,
    borderRadius: radius.sm,
    paddingHorizontal: space[2],
  },
  wordmark: { color: brand.navy, letterSpacing: 1 },
  rings: { flexDirection: 'row', alignItems: 'center' },
});
