import { createContext, useContext } from 'react';
import {
  Easing,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

/**
 * Hide-on-scroll for the tab bar (docs/bond-app-structure.md, Global layout).
 * Scrolling a tab's content down slides the bar (and the floating buttons that
 * sit on it) off the bottom; scrolling up, or getting back near the top, brings
 * it back. Everything runs on the UI thread: no React render per frame.
 */

/** 0 = bar shown, 1 = bar hidden. `target` is where it's heading, so a scroll doesn't restart it every frame. */
export type TabBarVisibility = { progress: SharedValue<number>; target: SharedValue<number>; height: number };

export const TabBarVisibilityContext = createContext<TabBarVisibility | null>(null);

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const SLIDE_MS = 220;
/** Px of scroll in one direction before the bar reacts, so small jiggles don't flicker it. */
const THRESHOLD = 12;
/** Always show the bar this close to the top. */
const TOP_ZONE = 24;

/** Show or hide the bar from a worklet or from React. */
export function setTabBarHidden(v: TabBarVisibility, hidden: boolean) {
  'worklet';
  const next = hidden ? 1 : 0;
  if (v.target.get() === next) return;
  v.target.set(next);
  v.progress.set(withTiming(next, { duration: SLIDE_MS, easing: EASE_OUT }));
}

/**
 * Scroll handler for a tab screen's `Animated.ScrollView` (`onScroll`, with
 * `scrollEventThrottle={16}`). Outside the tabs it does nothing.
 */
export function useTabBarScrollHandler() {
  const v = useContext(TabBarVisibilityContext);

  return useAnimatedScrollHandler<{ anchor?: number }>({
    onBeginDrag: (e, ctx) => {
      ctx.anchor = e.contentOffset.y;
    },
    onScroll: (e, ctx) => {
      if (!v) return;
      // Ignore rubber-banding past either end.
      const max = Math.max(e.contentSize.height - e.layoutMeasurement.height, 0);
      const y = Math.min(Math.max(e.contentOffset.y, 0), max);
      if (y <= TOP_ZONE) {
        setTabBarHidden(v, false);
        ctx.anchor = y;
        return;
      }
      const anchor = ctx.anchor ?? y;
      const dy = y - anchor;
      if (dy > THRESHOLD) {
        setTabBarHidden(v, true);
        ctx.anchor = y;
      } else if (dy < -THRESHOLD) {
        setTabBarHidden(v, false);
        ctx.anchor = y;
      }
    },
  });
}

/** translateY that slides something down with the bar (the bar itself and the buttons floating above it). */
export function useTabBarSlideStyle(extra = 0) {
  const v = useContext(TabBarVisibilityContext);
  const progress = v?.progress;
  const distance = (v?.height ?? 0) + extra;
  return useAnimatedStyle(() => ({
    transform: [{ translateY: (progress?.get() ?? 0) * distance }],
  }));
}
