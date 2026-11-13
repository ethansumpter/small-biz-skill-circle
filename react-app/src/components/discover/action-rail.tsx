import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { AI_BUTTON_CLEARANCE } from '@/components/ai-assistant-button';
import { GlassGroup, GlassSurface, useLiquidGlass, useTabBarOverlap } from '@/components/glass';
import { useTabBarSlideStyle } from '@/components/tab-bar-visibility';
import { space, useBondColors } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const ACTION_RAIL_WIDTH = 52;

/**
 * Floating Discover actions on the right, stacked above the AI bubble, as in
 * docs/discover-section-mockup.png: save for later · cross. Commenting lives on
 * the offer box and sending (👍) in the proposal box. Liquid glass on iOS 26+,
 * grouped so the two buttons blend.
 */
export function ActionRail({
  companyName,
  saved,
  onSave,
  onCross,
}: {
  companyName: string;
  saved: boolean;
  onSave: () => void;
  onCross: () => void;
}) {
  const glass = useLiquidGlass();
  const overlap = useTabBarOverlap();
  // Drops down with the tab bar when it hides on scroll.
  const slide = useTabBarSlideStyle();

  return (
    <Animated.View style={[styles.rail, { bottom: AI_BUTTON_CLEARANCE + overlap }, slide]} pointerEvents="box-none">
      <GlassGroup glass={glass} spacing={space[3]} style={styles.group}>
        <RailButton
          glass={glass}
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          label={saved ? `Remove ${companyName} from saved` : `Save ${companyName} for later`}
          selected={saved}
          onPress={onSave}
        />
        <RailButton glass={glass} icon="close" label={`Pass on ${companyName}`} onPress={onCross} />
      </GlassGroup>
    </Animated.View>
  );
}

function RailButton({
  glass,
  icon,
  label,
  onPress,
  selected,
}: {
  glass: boolean;
  icon: IconName;
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  const colors = useBondColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected !== undefined ? { selected } : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}
    >
      <GlassSurface
        glass={glass}
        interactive
        // Saved: powder-blue glass, matching the solid accent fill used elsewhere.
        tintColor={selected ? colors.accent : undefined}
        style={styles.surface}
        fallbackStyle={[
          styles.solid,
          {
            backgroundColor: selected ? colors.accent : colors.surfaceRaised,
            borderColor: selected ? 'transparent' : colors.line,
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={selected ? colors.onAccent : colors.ink} />
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    right: space[4] + 2,
  },
  group: { gap: space[3], alignItems: 'center' },
  button: { width: ACTION_RAIL_WIDTH, height: ACTION_RAIL_WIDTH },
  surface: {
    flex: 1,
    borderRadius: ACTION_RAIL_WIDTH / 2, // exact radius: glass doesn't draw a true circle from 999
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: {
    borderWidth: 1,
    // One shadow for iOS, Android and web (the old shadow* props are deprecated on web).
    boxShadow: '0px 2px 8px rgba(33, 36, 69, 0.15)',
  },
});
