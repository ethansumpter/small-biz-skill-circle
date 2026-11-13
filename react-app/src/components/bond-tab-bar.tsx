import Ionicons from '@expo/vector-icons/Ionicons';
import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConnectionIcon } from '@/components/bond-logo';
import { GlassSurface } from '@/components/glass';
import { useTabBarSlideStyle } from '@/components/tab-bar-visibility';
import { radius, space, useBondColors } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

type BondTab = {
  name: string;
  href: '/' | '/network' | '/new-proposal' | '/leads' | '/profile';
  /** Read out by screen readers; the bar shows icons only. */
  label: string;
  /** 'connection' draws two overlapping circles (see ConnectionIcon). */
  icon: IconName | 'connection';
  iconFocused: IconName | 'connection';
  /** The Instagram-style centre "create" button. */
  centre?: boolean;
};

/** Footer tabs, in the order set by docs/bond-app-structure.md. */
export const BOND_TABS: BondTab[] = [
  { name: 'discover', href: '/', label: 'Discover', icon: 'compass-outline', iconFocused: 'compass' },
  { name: 'network', href: '/network', label: 'Your Network', icon: 'connection', iconFocused: 'connection' },
  { name: 'new-proposal', href: '/new-proposal', label: 'New proposal', icon: 'add', iconFocused: 'add', centre: true },
  { name: 'leads', href: '/leads', label: 'Leads', icon: 'chatbubble-outline', iconFocused: 'chatbubble' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'person-circle-outline', iconFocused: 'person-circle' },
];

/**
 * Bond's bottom navigation. Render inside expo-router/ui `<Tabs>`; each trigger
 * matches a route declared by name in the layout's (hidden) `<TabList>`.
 *
 * It floats over the bottom of the screen and reports its height through
 * `onHeight`, so screens pad clear of it and it can slide away while you scroll
 * down (components/tab-bar-visibility.tsx). With `glass` (iOS 26+, see
 * components/glass.tsx) it is a liquid glass pill; otherwise a solid full-width bar.
 */
export function BondTabBar({ glass, onHeight }: { glass: boolean; onHeight?: (height: number) => void }) {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  // Slides past its own height plus a little, so the glass pill's shadow clears the edge too.
  const slide = useTabBarSlideStyle(space[2]);

  const tabs = BOND_TABS.map((tab) => (
    <TabTrigger key={tab.name} name={tab.name} asChild>
      {tab.centre ? <CentreButton tab={tab} glass={glass} /> : <TabButton tab={tab} glass={glass} />}
    </TabTrigger>
  ));

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={(e) => onHeight?.(Math.ceil(e.nativeEvent.layout.height))}
      style={[styles.floating, slide]}
    >
      {glass ? (
        <View
          pointerEvents="box-none"
          style={{
            paddingBottom: Math.max(insets.bottom - space[2], space[2]),
            paddingLeft: insets.left + space[3],
            paddingRight: insets.right + space[3],
          }}
        >
          {/* Untinted glass: a tint over the plain background just reads as flat grey. */}
          <GlassSurface glass style={styles.pill}>
            <View accessibilityRole="tablist" style={styles.row}>
              {tabs}
            </View>
          </GlassSurface>
        </View>
      ) : (
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
      )}
    </Animated.View>
  );
}

/** Pill height; corners are exactly half of it (glass needs a real radius, not 999). */
const PILL_HEIGHT = 60;
/** Selected tab on glass: a faint ink wash instead of the solid powder-blue pill. */
const GLASS_SELECTED = 'rgba(84, 74, 99, 0.12)';
const CENTRE_SIZE = 52;
const CENTRE_SIZE_GLASS = 44;

function TabIcon({ name, color }: { name: BondTab['icon']; color: string }) {
  if (name === 'connection') return <ConnectionIcon color={color} size={18} />;
  if (name === 'add') return null;
  return <Ionicons name={name} size={24} color={color} />;
}

type ButtonProps = TabTriggerSlotProps & { tab: BondTab; ref?: ComponentProps<typeof Pressable>['ref'] };

function TabButton({ tab, glass, isFocused, ...props }: ButtonProps & { glass: boolean }) {
  const colors = useBondColors();

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
    minHeight: 48,
  },
  indicator: {
    width: 56,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centreGlass: {
    width: CENTRE_SIZE_GLASS,
    height: CENTRE_SIZE_GLASS,
    borderRadius: CENTRE_SIZE_GLASS / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centre: {
    width: CENTRE_SIZE,
    height: CENTRE_SIZE,
    borderRadius: CENTRE_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
