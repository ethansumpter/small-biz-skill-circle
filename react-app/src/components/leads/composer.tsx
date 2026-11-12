import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/** Message box with attach, voice and send — per docs/bond-app-structure.md §4. */
export function Composer({ onSend, bottomInset }: { onSend: (text: string) => void; bottomInset: number }) {
  const colors = useBondColors();
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surfaceRaised,
          borderTopColor: colors.line,
          paddingBottom: Math.max(bottomInset, space[2]),
        },
      ]}
    >
      <ComposerIcon icon="attach" label="Attach image or file" onPress={() => notInPreview('Attachments')} />
      <TextInput
        accessibilityLabel="Message"
        value={text}
        onChangeText={setText}
        placeholder="Write a message"
        placeholderTextColor={colors.inkMuted}
        multiline
        style={[
          type.body,
          styles.input,
          { color: colors.ink, backgroundColor: colors.surface, borderColor: colors.line },
        ]}
      />
      {canSend ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          onPress={send}
          style={[styles.send, { backgroundColor: colors.ink }]}
        >
          <Ionicons name="arrow-up" size={20} color={colors.surface} />
        </Pressable>
      ) : (
        <ComposerIcon icon="mic-outline" label="Voice message" onPress={() => notInPreview('Voice messages')} />
      )}
    </View>
  );
}

function ComposerIcon({
  icon,
  label,
  onPress,
}: {
  icon: 'attach' | 'mic-outline';
  label: string;
  onPress: () => void;
}) {
  const colors = useBondColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={6} onPress={onPress} style={styles.icon}>
      <Ionicons name={icon} size={24} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space[2],
    paddingHorizontal: space[2],
    paddingTop: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingTop: space[2],
    paddingBottom: space[2],
  },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  send: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
