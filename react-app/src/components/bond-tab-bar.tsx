import Ionicons from '@expo/vector-icons/Ionicons';
import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RingsMark } from '@/components/bond-logo';
import { GlassSurface } from '@/components/glass';
import { fonts, radius, space, useBondColors } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

type BondTab = {
  name: string;
  href: '/' | '/network' | '/new-proposal' | '/leads' | '/profile';
  label: string;
  /** 'rings' draws Bond's two-overlapping-circles "match" motif. */
  icon: IconName | 'rings';
  iconFocused: IconName | 'rings';
  /** The Instagram-style centre "create" button. */
  centre?: boolean;
};

/** Footer tabs, in the order set by docs/bond-app-structure.md. */
export const BOND_TABS: BondTab[] = [
  { name: 'discover', href: '/', label: 'Discover', icon: 'compass-outline', iconFocused: 'compass' },
  { name: 'network', href: '/network', label: 'Your Network', icon: 'rings', iconFocused: 'rings' },
  { name: 'new-proposal', href: '/new-proposal', label: 'New proposal', icon: 'add', iconFocused: 'add', centre: true },
  { name: 'leads', href: '/leads', label: 'Leads', icon: 'chatbubble-outline', iconFocused: 'chatbubble' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'person-circle-outline', iconFocused: 'person-circle' },
];

/**
 * Bond's bottom navigation. Render inside expo-router/ui `<Tabs>`; each trigger
 * matches a route declared by name in the layout's (hidden) `<TabList>`.
 *
 * With `glass` (iOS 26+, see components/glass.tsx) it is a floating liquid glass
 * pill over the screen, and reports its height through `onHeight` so screens can
 * scroll clear of it. Otherwise it is the solid full-width bar below the screen.
 */
export function BondTabBar({ glass, onHeight }: { glass: boolean; onHeight?: (height: number) => void }) {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();

  const tabs = BOND_TABS.map((tab) => (
    <TabTrigger key={tab.name} name={tab.name} asChild>
      {tab.centre ? <CentreButton tab={tab} glass={glass} /> : <TabButton tab={tab} glass={glass} />}
    </TabTrigger>
  ));

  if (glass) {
    return (
      <View
        pointerEvents="box-none"
        onLayout={(e) => onHeight?.(Math.ceil(e.nativeEvent.layout.height))}
        style={[
          styles.floating,
          {
            paddingBottom: Math.max(insets.bottom - space[2], space[2]),
            paddingLeft: insets.left + space[3],
            paddingRight: insets.right + space[3],
          },
        ]}
      >
        {/* Untinted glass: a tint over the plain background just reads as flat grey. */}
        <GlassSurface glass style={styles.pill}>
          <View accessibilityRole="tablist" style={styles.row}>
            {tabs}
          </View>
        </GlassSurface>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: colors.surfaceRaised,
          borderTopColor: colors.line,
          paddingBottom: Math.max(insets.bottom, space[2]),
          paddingLeft: insets.left + space[2],
          paddingRight: insets.right + space[2],
        },
      ]}
    >
      {tabs}
    </View>
  );
}

/** Pill height; corners are exactly half of it (glass needs a real radius, not 999). */
const PILL_HEIGHT = 64;
/** Selected tab on glass: a faint ink wash instead of the solid powder-blue pill. */
const GLASS_SELECTED = 'rgba(84, 74, 99, 0.12)';
const CENTRE_SIZE = 52;
const CENTRE_SIZE_GLASS = 44;

function TabIcon({ name, color }: { name: BondTab['icon']; color: string }) {
  if (name === 'rings') return <RingsMark color={color} size={16} />;
  if (name === 'add') return null;
  return <Ionicons name={name} size={22} color={color} />;
}

type ButtonProps = TabTriggerSlotProps & { tab: BondTab; ref?: ComponentProps<typeof Pressable>['ref'] };

/** Below this width "Your Network" doesn't fit at 12px; iOS can shrink text to fit, Android and web can't. */
const NARROW_SCREEN = 400;

function TabButton({ tab, glass, isFocused, ...props }: ButtonProps & { glass: boolean }) {
  const colors = useBondColors();
  const narrow = useWindowDimensions().width < NARROW_SCREEN;

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: !!isFocused }}
      style={styles.tab}
    >
      <View style={[styles.indicator, isFocused && { backgroundColor: glass ? GLASS_SELECTED : colors.accent }]}>
        <TabIcon
          name={isFocused ? tab.iconFocused : tab.icon}
          color={isFocused ? (glass ? colors.ink : colors.onAccent) : colors.inkMuted}
        />
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={[
          styles.label,
          narrow && styles.labelNarrow,
          { color: isFocused ? colors.ink : colors.inkMuted, fontFamily: isFocused ? fonts.medium : fonts.regular },
        ]}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

function CentreButton({ tab, glass, isFocused, ...props }: ButtonProps & { glass: boolean }) {
  const colors = useBondColors();

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: !!isFocused }}
      style={({ pressed }) => [styles.tab, glass && { transform: [{ scale: pressed ? 0.94 : 1 }] }]}
    >
      {/* Solid, not glass: it already sits on the glass bar, and glass on glass looks muddy.
          On glass it's smaller and powder blue so it fits the pill; elsewhere solid ink. */}
      <View
        style={[
          glass ? styles.centreGlass : styles.centre,
          glass
            ? { backgroundColor: colors.accent, borderColor: isFocused ? colors.ink : 'transparent' }
            : { backgroundColor: colors.ink, borderColor: isFocused ? colors.accent : 'transparent' },
        ]}
      >
        <Ionicons name="add" size={glass ? 26 : 28} color={glass ? colors.onAccent : colors.surface} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: space[2],
  },
  floating: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  pill: { height: PILL_HEIGHT, borderRadius: PILL_HEIGHT / 2, paddingHorizontal: space[1], justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    minHeight: 48,
  },
  indicator: {
    width: 56,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.24,
  },
  centreGlass: {
    width: CENTRE_SIZE_GLASS,
    height: CENTRE_SIZE_GLASS,
    borderRadius: CENTRE_SIZE_GLASS / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelNarrow: { fontSize: 11, letterSpacing: 0 },
  centre: {
    width: CENTRE_SIZE,
    height: CENTRE_SIZE,
    borderRadius: CENTRE_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
