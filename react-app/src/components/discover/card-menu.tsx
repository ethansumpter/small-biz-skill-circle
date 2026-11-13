import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { overlay, radius, space, type, useBondColors } from '@/theme/tokens';

/** The Discover card's ⋮ menu: Block, Report (docs/bond-app-structure.md §1). */
export function CardMenu({
  visible,
  companyName,
  onClose,
  onBlock,
  onReport,
}: {
  visible: boolean;
  companyName: string;
  onClose: () => void;
  onBlock: () => void;
  onReport: () => void;
}) {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const items = [
    { label: `Block ${companyName}`, icon: 'ban-outline' as const, onPress: onBlock },
    { label: 'Report', icon: 'flag-outline' as const, onPress: onReport },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close menu" style={styles.backdrop} onPress={onClose} />
      <View
        style={[styles.sheet, { backgroundColor: colors.surfaceRaised, paddingBottom: Math.max(insets.bottom, space[4]) }]}
      >
        {items.map((item, i) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.item,
              i < items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Ionicons name={item.icon} size={22} color={colors.ink} />
            <Text style={[type.body, { color: colors.ink }]}>{item.label}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" onPress={onClose} style={[styles.cancel, { borderColor: colors.line }]}>
          <Text style={[type.label, { color: colors.ink }]}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: overlay.scrim },
  sheet: {
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: space[4],
    paddingTop: space[2],
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 52 },
  cancel: {
    marginTop: space[3],
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
