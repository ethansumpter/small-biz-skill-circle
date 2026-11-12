import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Message } from '@/data/demo-leads';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

export function MessageBubble({ message }: { message: Message }) {
  const colors = useBondColors();
  const mine = message.from === 'me';

  return (
    <View style={[styles.row, mine ? styles.mine : styles.theirs]}>
      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: colors.accent, borderBottomRightRadius: radius.sm }
            : {
                backgroundColor: colors.surfaceRaised,
                borderColor: colors.line,
                borderWidth: StyleSheet.hairlineWidth,
                borderBottomLeftRadius: radius.sm,
              },
        ]}
      >
        <Text style={[type.body, { color: mine ? colors.onAccent : colors.ink }]}>{message.text}</Text>
        {message.attachment ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Attachment ${message.attachment}`}
            onPress={() => notInPreview('Open attachment')}
            style={[styles.attachment, { borderColor: mine ? colors.onAccent : colors.line }]}
          >
            <Ionicons name="document-text-outline" size={18} color={mine ? colors.onAccent : colors.ink} />
            <Text numberOfLines={1} style={[type.label, styles.fileName, { color: mine ? colors.onAccent : colors.ink }]}>
              {message.attachment}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  mine: { justifyContent: 'flex-end' },
  theirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    gap: space[2],
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: space[2],
    paddingVertical: space[2],
  },
  fileName: { flexShrink: 1 },
});
