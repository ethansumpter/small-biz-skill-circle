import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { overlay, radius, space, type, useBondColors } from '@/theme/tokens';

export type ThreadAction = 'unmatch' | 'mute' | 'report' | 'block' | 'notifications';

type Item = { action: ThreadAction; label: string; icon: ComponentProps<typeof Ionicons>['name'] };

/** The thread's ⋮ menu, as a bottom sheet. Items per docs/bond-app-structure.md §4. */
export function ThreadMenu({
  visible,
  muted,
  onClose,
  onSelect,
}: {
  visible: boolean;
  muted: boolean;
  onClose: () => void;
  onSelect: (action: ThreadAction) => void;
}) {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();

  const items: Item[] = [
    { action: 'unmatch', label: 'Unmatch', icon: 'close-circle-outline' },
    muted
      ? { action: 'mute', label: 'Unmute', icon: 'notifications-outline' }
      : { action: 'mute', label: 'Mute', icon: 'notifications-off-outline' },
    { action: 'report', label: 'Report', icon: 'flag-outline' },
    { action: 'block', label: 'Block', icon: 'ban-outline' },
    { action: 'notifications', label: 'Enable notifications', icon: 'notifications-circle-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close menu" style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.surfaceRaised, paddingBottom: Math.max(insets.bottom, space[4]) },
        ]}
      >
        {items.map((item, i) => (
          <Pressable
            key={item.action}
            accessibilityRole="button"
            onPress={() => onSelect(item.action)}
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
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={[styles.cancel, { borderColor: colors.line }]}
        >
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 52,
  },
  cancel: {
    marginTop: space[3],
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
