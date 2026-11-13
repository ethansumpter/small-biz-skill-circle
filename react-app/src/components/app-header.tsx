import { router, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BondLogo } from '@/components/bond-logo';
import { IconButton } from '@/components/ui';
import { space, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/** Height of the logo row: fits a 44px IconButton, so the header is the same size on every page. */
const BAR_HEIGHT = 44;

/**
 * The top bar on every page (docs/bond-app-structure.md, Global layout).
 * Rendered once in the root layout above the navigator, so it never scrolls or
 * moves when you change page. It owns the top safe-area inset; screens below it
 * must not add `insets.top` again.
 */
export function AppHeader() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + space[2], backgroundColor: colors.surface, borderBottomColor: colors.line },
      ]}
    >
      <View style={styles.bar}>
        <BondLogo />
        <View style={styles.right}>
          {pathname === '/profile' ? (
            <>
              <IconButton icon="options-outline" label="Preferences" onPress={() => notInPreview('Preferences')} />
              <IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: space[4],
    paddingBottom: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  /** Exact height (not min) so pages with header icons match pages without. */
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  right: { flexDirection: 'row', alignItems: 'center' },
});
