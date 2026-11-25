import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useBondColors } from '@/theme/tokens';

/**
 * Bond's "AI" mark: a four-point sparkle (docs/bond-brand-kit.md). Used wherever
 * something is AI-powered: the assistant bubble and AI matching in the filters.
 * Decorative: the label next to it (or the button's own label) says what it is.
 */
export function AiSparkle({ size = 16, color }: { size?: number; color?: string }) {
  const colors = useBondColors();
  return (
    <MaterialCommunityIcons
      name="star-four-points"
      size={size}
      color={color ?? colors.link}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
