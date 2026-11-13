import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import Animated from 'react-native-reanimated';

import { GlassSurface, useLiquidGlass, useTabBarOverlap } from '@/components/glass';
import { useTabBarSlideStyle } from '@/components/tab-bar-visibility';
import { space, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

const SIZE = 56;

/** Size + offset of the floating bubble; screens add this to their bottom padding. */
export const AI_BUTTON_CLEARANCE = SIZE + space[4] * 2;

/** Bottom padding for a tab screen's scroll content: clears the AI bubble and, on iOS glass, the bar. */
export function useBottomClearance(extra = 0): number {
  return AI_BUTTON_CLEARANCE + useTabBarOverlap() + extra;
}

/**
 * Floating AI assistant bubble, bottom-right above the tab bar on every tab
 * screen (docs/bond-app-structure.md, global layout). Liquid glass on iOS 26+.
 */
export function AiAssistantButton() {
  const colors = useBondColors();
  const glass = useLiquidGlass();
  const overlap = useTabBarOverlap();
  // Drops down with the tab bar when it hides on scroll.
  const slide = useTabBarSlideStyle();

  return (
    <Animated.View style={[styles.position, { bottom: space[4] + overlap }, slide]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="AI assistant"
        onPress={() => notInPreview('AI assistant')}
        style={({ pressed }) => [
          styles.button,
          // Glass must stay fully opaque, so it shrinks on press instead of fading.
          glass ? { transform: [{ scale: pressed ? 0.94 : 1 }] } : { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <GlassSurface
          glass={glass}
          interactive
          style={styles.surface}
          fallbackStyle={[styles.solid, { backgroundColor: colors.surfaceRaised, borderColor: colors.ink }]}
        >
          <Ionicons name="happy-outline" size={30} color={colors.ink} />
        </GlassSurface>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  position: { position: 'absolute', right: space[4] },
  button: { width: SIZE, height: SIZE },
  surface: {
    flex: 1,
    borderRadius: SIZE / 2, // exact radius: glass doesn't draw a true circle from 999
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: {
    borderWidth: 2,
    // One shadow for iOS, Android and web (the old shadow* props are deprecated on web).
    boxShadow: '0px 2px 8px rgba(33, 36, 69, 0.15)',
  },
});
