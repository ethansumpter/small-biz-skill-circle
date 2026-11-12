import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, space, type, useBondColors } from '@/theme/tokens';

export const PROFILE_TABS = ['Get More', 'Safety', 'Overview'] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

/** Segmented control under the avatar. */
export function ProfileTabs({ value, onChange }: { value: ProfileTab; onChange: (tab: ProfileTab) => void }) {
  const colors = useBondColors();

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.track, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }]}
    >
      {PROFILE_TABS.map((tab) => {
        const selected = tab === value;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab)}
            style={[styles.segment, selected && { backgroundColor: colors.accent }]}
          >
            <Text style={[type.label, { color: selected ? colors.onAccent : colors.inkMuted }]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space[1],
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
