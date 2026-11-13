import { Image, StyleSheet, Text, View } from 'react-native';

import { brand, radius, space, type } from '@/theme/tokens';

/** `bond-logo-atoms.png` cropped to its content and scaled down for the header (187×360). */
const ATOMS = require('../../assets/logo/bond-logo-atoms-header.png');
const ATOMS_HEIGHT = 36;
const ATOMS_WIDTH = Math.round((ATOMS_HEIGHT * 187) / 360);

/**
 * The app header logo: the two atoms (no B outline, so it doesn't repeat the B of the
 * text) beside the `BOND` text wordmark in grape. Atoms kept at 36px tall: the orbit
 * detail is lost below about 32px. Always on a platinum tile, because the logo is for
 * light grounds only and the header is dark in dark mode.
 */
export function BondLogo() {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="Bond" style={styles.tile}>
      <Image source={ATOMS} style={styles.atoms} resizeMode="contain" />
      <Text style={[type.heading, styles.wordmark]}>BOND</Text>
    </View>
  );
}

/**
 * Two overlapping circles: a simple "connection" icon for the Your Network tab. Not the logo
 * (that's the two atoms); the logo's detail is lost at tab-icon sizes, so this stays drawn.
 */
export function ConnectionIcon({ color, size, strokeWidth = 2 }: { color: string; size: number; strokeWidth?: number }) {
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
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  atoms: { width: ATOMS_WIDTH, height: ATOMS_HEIGHT },
  wordmark: { color: brand.vintageGrape, letterSpacing: 1 },
  rings: { flexDirection: 'row', alignItems: 'center' },
});
