import { StyleSheet, Text, View } from 'react-native';

import { fonts, space, useBondColors } from '@/theme/tokens';

/** Temporary screen body until each tab is built out. */
export function PlaceholderScreen({ title }: { title: string }) {
  const colors = useBondColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface}]}>
      <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[4],
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 24,
    lineHeight: 32,
  },
});
