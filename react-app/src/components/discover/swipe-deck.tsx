import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { CompanyAvatar } from '@/components/company-avatar';
import { Chip } from '@/components/ui';
import type { Company } from '@/data/companies';
import { overlay, radius, space, swipeTint, type, useBondColors } from '@/theme/tokens';

export type SwipeDirection = 'left' | 'right';

/** How far (px) a drag must travel, or how fast (px/ms) it must be flung, to count as a swipe. */
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 0.6;
const FLY_MS = 220;
const SPRING = { damping: 18, stiffness: 180 };
/** Strongest the green/red wash gets, so the card's text stays readable under it. */
const MAX_TINT = 0.45;

/**
 * Discover's card overview (docs/bond-app-structure.md §1): the top company as a
 * summary card with the next one peeking behind. Swipe right to like, left to
 * pass; the card washes green or red as it's dragged. Tap to open the full
 * profile. Screen readers get Like / Pass actions instead of the gesture.
 */
export function SwipeDeck({
  top,
  next,
  returnToken,
  onSwipe,
  onOpen,
}: {
  top: Company;
  next: Company | undefined;
  /** Bumped when a right swipe is cancelled (like sheet closed), to bring the card back. */
  returnToken: number;
  onSwipe: (company: Company, direction: SwipeDirection) => void;
  onOpen: (company: Company) => void;
}) {
  // Keyed by company so the card behind keeps its instance (and animates up) when it becomes the top.
  const cards = next ? [next, top] : [top];
  return (
    <View style={styles.deck}>
      {cards.map((company) => (
        <DeckCard
          key={company.id}
          company={company}
          isTop={company.id === top.id}
          returnToken={returnToken}
          onSwipe={onSwipe}
          onOpen={onOpen}
        />
      ))}
    </View>
  );
}

function DeckCard({
  company,
  isTop,
  returnToken,
  onSwipe,
  onOpen,
}: {
  company: Company;
  isTop: boolean;
  returnToken: number;
  onSwipe: (company: Company, direction: SwipeDirection) => void;
  onOpen: (company: Company) => void;
}) {
  const colors = useBondColors();
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const depth = useSharedValue(isTop ? 0 : 1);
  // Which way the card was last dragged (1 right, -1 left). The tint only shows that side's colour,
  // so the spring overshooting past centre on the way back doesn't flash the other colour.
  const side = useSharedValue(0);

  // PanResponder callbacks are created once; read the latest props through a ref.
  const latest = useRef({ company, onSwipe, reduced, width });
  latest.current = { company, onSwipe, reduced, width };

  const flyOff = useRef((direction: SwipeDirection) => {
    const { company: c, onSwipe: done, reduced: still, width: w } = latest.current;
    if (still) {
      done(c, direction);
      return;
    }
    side.value = direction === 'right' ? 1 : -1;
    const target = side.value * w * 1.4;
    x.value = withTiming(target, { duration: FLY_MS }, (finished) => {
      if (finished) scheduleOnRN(done, c, direction);
    });
  }).current;

  const settle = useRef(() => {
    if (latest.current.reduced) {
      x.value = 0;
      y.value = 0;
    } else {
      x.value = withSpring(0, SPRING);
      y.value = withSpring(0, SPRING);
    }
  }).current;

  const responder = useMemo(
    () =>
      PanResponder.create({
        // Let taps through to the Pressable; claim only clearly sideways drags.
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
        onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => {
          x.value = g.dx;
          y.value = g.dy * 0.15;
          if (g.dx !== 0) side.value = Math.sign(g.dx);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx > SWIPE_DISTANCE || g.vx > SWIPE_VELOCITY) flyOff('right');
          else if (g.dx < -SWIPE_DISTANCE || g.vx < -SWIPE_VELOCITY) flyOff('left');
          else settle();
        },
        onPanResponderTerminate: () => settle(),
      }),
    [flyOff, settle, x, y, side],
  );

  // Moving up from behind: grow into place.
  useEffect(() => {
    if (isTop) depth.value = latest.current.reduced ? 0 : withSpring(0, SPRING);
  }, [isTop, depth]);

  // Like sheet closed without sending: come back.
  useEffect(() => {
    if (returnToken > 0) settle();
  }, [returnToken, settle]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value + depth.value * space[3] },
      { rotate: `${interpolate(x.value, [-width, 0, width], [-14, 0, 14], Extrapolation.CLAMP)}deg` },
      { scale: 1 - depth.value * 0.05 },
    ],
  }));
  // Green builds up dragging right (like), red dragging left (pass) — only on the side being dragged.
  const likeStyle = useAnimatedStyle(() => ({
    opacity: side.value === 1 ? interpolate(x.value, [0, SWIPE_DISTANCE], [0, MAX_TINT], Extrapolation.CLAMP) : 0,
  }));
  const passStyle = useAnimatedStyle(() => ({
    opacity: side.value === -1 ? interpolate(x.value, [-SWIPE_DISTANCE, 0], [MAX_TINT, 0], Extrapolation.CLAMP) : 0,
  }));

  return (
    <Animated.View
      {...(isTop ? responder.panHandlers : {})}
      pointerEvents={isTop ? 'auto' : 'none'}
      importantForAccessibility={isTop ? 'auto' : 'no-hide-descendants'}
      accessibilityElementsHidden={!isTop}
      style={[
        styles.card,
        { backgroundColor: colors.surfaceRaised, borderColor: colors.line, zIndex: isTop ? 2 : 1 },
        cardStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${company.name}. ${company.industry}, ${company.location}. We can offer: ${company.offer}. We're looking for: ${company.lookingFor}.`}
        accessibilityHint="Opens their full profile. Swipe right to like, left to pass."
        accessibilityActions={[
          { name: 'activate', label: 'Open full profile' },
          { name: 'like', label: 'Like' },
          { name: 'pass', label: 'Pass' },
        ]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'like') flyOff('right');
          else if (e.nativeEvent.actionName === 'pass') flyOff('left');
          else onOpen(company);
        }}
        onPress={() => onOpen(company)}
        style={styles.press}
      >
        <View style={styles.identity}>
          <CompanyAvatar companyId={company.id} size={72} />
          <View style={styles.flex}>
            <Text numberOfLines={2} style={[type.heading, { color: colors.ink }]}>
              {company.name}
            </Text>
            <View style={styles.badges}>
              {company.verified ? (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Ionicons name="shield-checkmark" size={14} color={colors.onAccent} />
                  <Text style={[type.caption, { color: colors.onAccent }]}>Verified</Text>
                </View>
              ) : null}
              <View style={styles.badges}>
                <Ionicons name="star" size={14} color={colors.ink} />
                <Text style={[type.label, { color: colors.ink }]}>{company.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text numberOfLines={1} style={[type.label, { color: colors.inkMuted }]}>
          {company.industry} · {company.location} · {company.size === 'SME' ? 'SME' : 'Micro business'}
        </Text>

        <View style={[styles.offer, { backgroundColor: colors.surface }]}>
          <Summary label="We can offer" text={company.offer} />
          <View style={[styles.divider, { backgroundColor: colors.line }]} />
          <Summary label="We're looking for" text={company.lookingFor} />
        </View>

        <View style={styles.chips}>
          {company.interests.slice(0, 3).map((interest) => (
            <Chip key={interest} label={interest} />
          ))}
        </View>

        <View style={styles.more}>
          <Text style={[type.label, { color: colors.link }]}>Tap to see full profile</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.link} />
        </View>
      </Pressable>

      {/* Colour wash that builds up as the card is dragged */}
      <Animated.View pointerEvents="none" style={[styles.tint, { backgroundColor: swipeTint.like }, likeStyle]} />
      <Animated.View pointerEvents="none" style={[styles.tint, { backgroundColor: swipeTint.pass }, passStyle]} />
    </Animated.View>
  );
}

function Summary({ label, text }: { label: string; text: string }) {
  const colors = useBondColors();
  return (
    <View style={styles.summary}>
      <Text style={[type.caption, { color: colors.inkMuted }]}>{label}</Text>
      <Text numberOfLines={3} style={[type.subheading, { color: colors.ink }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  deck: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  card: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.md * 1.5,
    borderWidth: 1,
    boxShadow: overlay.shadow,
    overflow: 'hidden',
    userSelect: 'none', // web: dragging with a mouse shouldn't select text
  },
  press: { flex: 1, padding: space[4], gap: space[3] },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  badges: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[1] },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    borderRadius: radius.full,
    paddingHorizontal: space[2],
    paddingVertical: 2,
  },
  offer: { flexShrink: 1, borderRadius: radius.md, padding: space[4], gap: space[3], overflow: 'hidden' },
  summary: { gap: space[1], flexShrink: 1 },
  divider: { height: StyleSheet.hairlineWidth },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  more: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: space[1] },
  tint: { ...StyleSheet.absoluteFill },
});
