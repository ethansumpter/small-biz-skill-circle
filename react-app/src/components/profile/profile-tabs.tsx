import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, space, type, useBondColors } from '@/theme/tokens';

export const PROFILE_TABS = ['Get more', 'Safety', 'Overview'] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

/** Underlined text tabs under the firm's logo. */
export function ProfileTabs({ value, onChange }: { value: ProfileTab; onChange: (tab: ProfileTab) => void }) {
  const colors = useBondColors();

  return (
    <View accessibilityRole="tablist" style={[styles.row, { borderBottomColor: colors.ink }]}>
      {PROFILE_TABS.map((tab) => {
        const selected = tab === value;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab)}
            style={styles.tab}
          >
            <Text
              style={[
                type.body,
                { color: selected ? colors.ink : colors.inkMuted, fontFamily: selected ? fonts.semibold : fonts.regular },
              ]}
            >
              {tab}
            </Text>
            <View style={[styles.indicator, selected && { backgroundColor: colors.ink }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: space[2],
    gap: space[2],
    minHeight: 44,
  },
  indicator: {
    alignSelf: 'stretch',
    height: 3,
    marginBottom: -1,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
