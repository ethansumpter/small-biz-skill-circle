import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AI_BUTTON_CLEARANCE } from '@/components/ai-assistant-button';
import { radius, space, useBondColors } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const ACTION_RAIL_WIDTH = 52;

/**
 * Floating Discover actions on the right, stacked above the AI bubble, as in
 * docs/discover-section-mockup.png: save for later · cross. Commenting lives on
 * the offer box and sending (👍) in the proposal box.
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
  return (
    <View style={styles.rail} pointerEvents="box-none">
      <RailButton
        icon={saved ? 'bookmark' : 'bookmark-outline'}
        label={saved ? `Remove ${companyName} from saved` : `Save ${companyName} for later`}
        selected={saved}
        onPress={onSave}
      />
      <RailButton icon="close" label={`Pass on ${companyName}`} onPress={onCross} />
    </View>
  );
}

function RailButton({
  icon,
  label,
  onPress,
  selected,
}: {
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
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected ? colors.accent : colors.surfaceRaised,
          borderColor: selected ? 'transparent' : colors.line,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
    >
      <Ionicons name={icon} size={22} color={selected ? colors.onAccent : colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    right: space[4] + 2,
    bottom: AI_BUTTON_CLEARANCE,
    gap: space[3],
    alignItems: 'center',
  },
  button: {
    width: ACTION_RAIL_WIDTH,
    height: ACTION_RAIL_WIDTH,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#212445',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
