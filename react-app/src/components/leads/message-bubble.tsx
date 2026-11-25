import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import type { Message } from '@/data/demo-leads';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/** Two taps (or clicks) within this many ms count as a double tap. */
const DOUBLE_TAP_MS = 300;

/**
 * One chat message. Double-tap (double-click on web) to like it, WhatsApp-style:
 * a ❤️ pops onto the bubble's bottom corner; tap the heart or double-tap again to
 * remove it. Screen readers get a Like / Unlike action instead.
 */
export function MessageBubble({
  message,
  liked = false,
  onToggleLike,
}: {
  message: Message;
  liked?: boolean;
  onToggleLike?: () => void;
}) {
  const colors = useBondColors();
  const mine = message.from === 'me';
  const lastTap = useRef(0);

  const onPress = () => {
    if (!onToggleLike) return;
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      onToggleLike();
    } else {
      lastTap.current = now;
    }
  };

  const actions = [
    ...(onToggleLike ? [{ name: 'like', label: liked ? 'Unlike' : 'Like' }] : []),
    ...(message.attachment ? [{ name: 'attachment', label: `Open ${message.attachment}` }] : []),
  ];

  return (
    <View style={[styles.row, mine ? styles.mine : styles.theirs, liked && styles.likedRow]}>
      <Pressable
        accessible
        accessibilityLabel={`${mine ? 'You' : 'They'}: ${message.text}${message.attachment ? `. Attachment ${message.attachment}` : ''}${liked ? '. Liked' : ''}`}
        accessibilityActions={actions}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'like') onToggleLike?.();
          else if (e.nativeEvent.actionName === 'attachment') notInPreview('Open attachment');
        }}
        onPress={onPress}
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

        {liked ? (
          <Animated.View
            entering={ZoomIn.duration(180)}
            exiting={FadeOut.duration(120)}
            style={[styles.heartWrap, mine ? styles.heartMine : styles.heartTheirs]}
          >
            <Pressable
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              hitSlop={8}
              onPress={onToggleLike}
              style={[styles.heart, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }]}
            >
              <Text style={styles.heartText}>❤️</Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </Pressable>
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
    // web: double-clicking to like shouldn't select the text
    userSelect: 'none',
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
  // Room under a liked bubble for the heart that hangs off its bottom edge.
  likedRow: { paddingBottom: space[4] },
  heartWrap: { position: 'absolute', bottom: -18 },
  heartMine: { right: space[2] },
  heartTheirs: { left: space[2] },
  heart: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  heartText: { fontSize: 13, lineHeight: 18 },
});
