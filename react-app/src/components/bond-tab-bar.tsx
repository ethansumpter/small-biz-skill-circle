import Ionicons from '@expo/vector-icons/Ionicons';
import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, radius, space, useBondColors } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

type BondTab = {
  name: string;
  href: '/' | '/network' | '/new-proposal' | '/leads' | '/profile';
  label: string;
  icon: IconName;
  iconFocused: IconName;
  /** The Instagram-style centre "create" button. */
  centre?: boolean;
};

/** Footer tabs, in the order set by docs/bond-app-structure.md. */
export const BOND_TABS: BondTab[] = [
  { name: 'discover', href: '/', label: 'Discover', icon: 'compass-outline', iconFocused: 'compass' },
  { name: 'network', href: '/network', label: 'Your Network', icon: 'people-outline', iconFocused: 'people' },
  { name: 'new-proposal', href: '/new-proposal', label: 'New proposal', icon: 'add', iconFocused: 'add', centre: true },
  { name: 'leads', href: '/leads', label: 'Leads', icon: 'chatbubbles-outline', iconFocused: 'chatbubbles' },
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

type ButtonProps = TabTriggerSlotProps & { tab: BondTab; ref?: ComponentProps<typeof Pressable>['ref'] };

function TabButton({ tab, isFocused, ...props }: ButtonProps) {
  const colors = useBondColors();

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: !!isFocused }}
      style={styles.tab}
    >
      <View style={[styles.indicator, isFocused && { backgroundColor: colors.accent }]}>
        <Ionicons
          name={isFocused ? tab.iconFocused : tab.icon}
          size={22}
          color={isFocused ? colors.onAccent : colors.inkMuted}
        />
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={[
          styles.label,
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
        <Ionicons name={tab.icon} size={28} color={colors.surface} />
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
  centre: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
