import { GlassContainer, GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, type ColorValue, Platform, type StyleProp, View, type ViewStyle } from 'react-native';

/**
 * iOS liquid glass, iOS only (docs/bond-brand-kit.md, "iOS liquid glass").
 * Used for the footer bar and the floating buttons. Everywhere else (Android,
 * web, iOS before 26, or Reduce Transparency on) the same components draw
 * Bond's normal solid surfaces instead.
 */

/** Checked once: whether this build and device can draw liquid glass at all. */
const GLASS_SUPPORTED = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

/** True when liquid glass should be drawn right now (respects Reduce Transparency). */
export function useLiquidGlass(): boolean {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (!GLASS_SUPPORTED) return;
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((on) => mounted && setReduceTransparency(on));
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return GLASS_SUPPORTED && !reduceTransparency;
}

/**
 * A glass surface on iOS 26+, or a plain View with `fallbackStyle` elsewhere.
 * Don't animate opacity on this or its parents; glass stops rendering below 1.
 */
export function GlassSurface({
  glass,
  style,
  fallbackStyle,
  tintColor,
  interactive,
  children,
}: {
  glass: boolean;
  style?: StyleProp<ViewStyle>;
  /** Extra styles for the non-glass look (solid background, border, shadow). */
  fallbackStyle?: StyleProp<ViewStyle>;
  tintColor?: ColorValue;
  interactive?: boolean;
  children?: ReactNode;
}) {
  if (!glass) return <View style={[style, fallbackStyle]}>{children}</View>;
  return (
    <GlassView style={style} tintColor={tintColor} isInteractive={interactive} glassEffectStyle="regular">
      {children}
    </GlassView>
  );
}

/** Groups nearby glass surfaces so they blend; a plain View when glass is off. */
export function GlassGroup({
  glass,
  spacing,
  style,
  children,
}: {
  glass: boolean;
  spacing: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  if (!glass) return <View style={style}>{children}</View>;
  return (
    <GlassContainer spacing={spacing} style={style}>
      {children}
    </GlassContainer>
  );
}

/**
 * How much of the bottom of a tab screen the floating tab bar covers (glass or
 * solid: both float so the bar can hide on scroll). Screens pad by this.
 */
export const TabBarOverlapContext = createContext(0);

export function useTabBarOverlap(): number {
  return useContext(TabBarOverlapContext);
}

