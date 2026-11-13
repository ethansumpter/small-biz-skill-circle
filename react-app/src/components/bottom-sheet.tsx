import { type ReactNode, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { space, useBondColors } from '@/theme/tokens';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** iOS sheet curve. */
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);
const IN_MS = 300;
const OUT_MS = 200;
export const SHEET_RADIUS = 24;

/**
 * Bond's bottom sheet: grab handle, rounded top, slides up over a fading
 * backdrop and slides away before unmounting (Reduce Motion: fades only).
 * Controlled by `visible`; the backdrop and Android back call `onRequestClose`,
 * and the parent closes it by setting `visible` false, which plays the exit.
 * Children stay rendered until the exit finishes.
 */
export function BottomSheet({
  visible,
  onRequestClose,
  avoidKeyboard,
  children,
}: {
  visible: boolean;
  onRequestClose: () => void;
  /** Lift the sheet above the keyboard (sheets with a text field). */
  avoidKeyboard?: boolean;
  children: ReactNode;
}) {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  // Keeps the Modal up while the exit plays.
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  const progress = useSharedValue(0);
  const height = useSharedValue(800);

  useEffect(() => {
    if (visible) {
      progress.set(withTiming(1, { duration: IN_MS, easing: EASE_SHEET }));
    } else {
      progress.set(
        withTiming(0, { duration: OUT_MS, easing: EASE_OUT }, (finished) => {
          if (finished) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const sheetStyle = useAnimatedStyle(() =>
    reduced ? { opacity: progress.get() } : { transform: [{ translateY: (1 - progress.get()) * height.get() }] },
  );

  const body = (
    <>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
      <Pressable accessibilityLabel="Close" style={styles.flex} onPress={onRequestClose} />
      <Animated.View
        onLayout={(e) => height.set(e.nativeEvent.layout.height)}
        style={[
          styles.sheet,
          { backgroundColor: colors.surfaceRaised, paddingBottom: Math.max(insets.bottom, space[4]) },
          sheetStyle,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.line }]} />
        {children}
      </Animated.View>
    </>
  );

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onRequestClose}>
      {avoidKeyboard ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { backgroundColor: 'rgba(33, 36, 69, 0.4)' },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    paddingHorizontal: space[4],
    paddingTop: space[2],
    gap: space[4],
  },
  handle: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3 },
});
