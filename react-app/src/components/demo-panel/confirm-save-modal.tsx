import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, type, useBondColors } from '@/theme/tokens';
import { type Change, formatPath, previewValue } from '@/utils/json-diff';

export type CompanyChanges = { id: string; name: string; changes: Change[] };

/** Lists every pending edit and asks for confirmation before companies.json is written. */
export function ConfirmSaveModal({
  visible,
  groups,
  saving,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  groups: CompanyChanges[];
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const total = groups.reduce((n, g) => n + g.changes.length, 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.dialog,
            { backgroundColor: colors.surfaceRaised, marginTop: insets.top + space[6], marginBottom: insets.bottom + space[6] },
          ]}
        >
          <View style={styles.head}>
            <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
              Save {total} {total === 1 ? 'change' : 'changes'} to companies.json?
            </Text>
            <Text style={[type.caption, { color: colors.inkMuted }]}>
              This overwrites src/data/companies.json on the computer running the dev server. Check the list below.
            </Text>
          </View>

          <ScrollView style={[styles.list, { borderColor: colors.line }]} contentContainerStyle={styles.listContent}>
            {groups.map((group) => (
              <View key={group.id} style={styles.group}>
                <Text style={[type.label, { color: colors.ink }]}>
                  {group.name} <Text style={{ color: colors.inkMuted }}>({group.id})</Text>
                </Text>
                {group.changes.map((change, i) => (
                  <View key={i} style={[styles.change, { backgroundColor: colors.surface }]}>
                    <Text style={[type.caption, { color: colors.inkMuted }]}>
                      {formatPath(change.path)} · {change.kind}
                    </Text>
                    {change.kind !== 'added' ? (
                      <Text style={[type.caption, styles.before, { color: colors.inkMuted }]}>
                        − {previewValue(change.before)}
                      </Text>
                    ) : null}
                    {change.kind !== 'removed' ? (
                      <Text style={[type.caption, { color: colors.ink }]}>+ {previewValue(change.after)}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              disabled={saving}
              style={({ pressed }) => [styles.button, { borderColor: colors.line, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[type.label, { color: colors.ink }]}>Keep editing</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              disabled={saving}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.ink, borderColor: colors.ink, opacity: saving ? 0.6 : pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[type.label, { color: colors.surface }]}>{saving ? 'Saving…' : 'Confirm and save'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: space[4] },
  dialog: {
    flexShrink: 1,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    borderRadius: radius.md,
    padding: space[4],
    gap: space[3],
  },
  head: { gap: space[1] },
  list: { flexShrink: 1, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  listContent: { paddingVertical: space[3], gap: space[4] },
  group: { gap: space[2] },
  change: { borderRadius: radius.sm, padding: space[2], gap: 2 },
  before: { textDecorationLine: 'line-through' },
  actions: { flexDirection: 'row', gap: space[2], justifyContent: 'flex-end' },
  button: {
    minHeight: 44,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
