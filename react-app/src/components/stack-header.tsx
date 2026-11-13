import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/ui';
import { space, type, useBondColors } from '@/theme/tokens';

/** Back button and title for screens pushed on the root stack, below the global AppHeader. */
export function StackHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const colors = useBondColors();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.surfaceRaised, borderBottomColor: colors.line },
      ]}
    >
      <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
      <View style={styles.titles}>
        <Text accessibilityRole="header" numberOfLines={1} style={[type.subheading, { color: colors.ink }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titles: { flex: 1 },
});
