import Ionicons from '@expo/vector-icons/Ionicons';
import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RingsMark } from '@/components/bond-logo';
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
 */
export function BondTabBar() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();

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
      {BOND_TABS.map((tab) => (
        <TabTrigger key={tab.name} name={tab.name} asChild>
          {tab.centre ? <CentreButton tab={tab} /> : <TabButton tab={tab} />}
        </TabTrigger>
      ))}
    </View>
  );
}

function TabIcon({ name, color }: { name: BondTab['icon']; color: string }) {
  if (name === 'rings') return <RingsMark color={color} size={16} />;
  if (name === 'add') return null;
  return <Ionicons name={name} size={22} color={color} />;
}

type ButtonProps =TabTriggerSlotProps & { tab: BondTab; ref?: ComponentProps<typeof Pressable>['ref'] };

/** Below this width "Your Network" doesn't fit at 12px; iOS can shrink text to fit, Android and web can't. */
const NARROW_SCREEN = 400;

function TabButton({ tab, isFocused, ...props }: ButtonProps) {
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
      <View style={[styles.indicator, isFocused && { backgroundColor: colors.accent }]}>
        <TabIcon
          name={isFocused ? tab.iconFocused : tab.icon}
          color={isFocused ? colors.onAccent : colors.inkMuted}
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

function CentreButton({ tab, isFocused, ...props }: ButtonProps) {
  const colors = useBondColors();

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: !!isFocused }}
      style={styles.tab}
    >
      <View
        style={[
          styles.centre,
          { backgroundColor: colors.ink, borderColor: isFocused ? colors.accent : 'transparent' },
        ]}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
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
  labelNarrow: { fontSize: 11, letterSpacing: 0 },
  centre: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
