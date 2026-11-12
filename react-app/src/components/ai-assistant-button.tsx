import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { radius, space, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/** Size + offset of the floating bubble; screens add this to their bottom padding. */
export const AI_BUTTON_CLEARANCE = 56 + space[4] * 2;

/**
 * Floating AI assistant bubble, bottom-right above the tab bar on every tab
 * screen (docs/bond-app-structure.md, global layout).
 */
export function AiAssistantButton() {
  const colors = useBondColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="AI assistant"
      onPress={() => notInPreview('AI assistant')}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.surfaceRaised, borderColor: colors.ink, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Ionicons name="happy-outline" size={30} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: space[4],
    bottom: space[4],
    width: 56,
    height: 56,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    // One shadow for iOS, Android and web (the old shadow* props are deprecated on web).
    boxShadow: '0px 2px 8px rgba(33, 36, 69, 0.15)',
  },
});
