import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

import { BottomSheet } from '@/components/bottom-sheet';
import { FILTER_LABELS, FILTER_OPTIONS, type FilterKey, type Filters, industriesOf } from '@/data/discover';
import { useCompanies } from '@/state/preview';
import { fonts, radius, space, type, useBondColors } from '@/theme/tokens';

const CHIP_HEIGHT = 36;

/** Motion (see expo-animation guidance): strong ease-out for UI. The sheet's own motion is BottomSheet's. */
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** Chip colour, ×, Clear all: small state changes. */
const CHIP_MS = 180;
/** Row reflow when a chip's width changes or Clear all appears. */
const reflow = LinearTransition.duration(CHIP_MS).easing(EASE_OUT);
const appear = FadeIn.duration(CHIP_MS).easing(EASE_OUT);
const disappear = FadeOut.duration(120).easing(EASE_OUT);

/**
 * Filter row (docs/bond-app-structure.md §1, laid out per
 * docs/discover-section-mockup.png): a bare filter icon (all filters) with a
 * count badge, a chip per `primary` filter, More… for the rest, then Clear all
 * once anything is on. Set chips fill with ink and get an × to clear them in
 * one tap. Each chip opens a sheet of single-choice options; changes apply
 * straight away, and the sheet's button shows `resultCount` when given.
 */
export function FilterBar({
  filters,
  onChange,
  primary = ['location', 'industry'],
  more = ['size', 'identity', 'collaboration'],
  resultCount,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  primary?: FilterKey[];
  more?: FilterKey[];
  /** How many businesses the current filters leave; shown on the sheet's button. */
  resultCount?: number;
}) {
  const colors = useBondColors();
  const [sheet, setSheet] = useState<FilterKey[] | null>(null);
  const all = [...primary, ...more];
  const activeCount = all.filter((k) => filters[k]).length;
  const moreCount = more.filter((k) => filters[k]).length;

  const clear = (keys: FilterKey[]) => {
    const next = { ...filters };
    keys.forEach((k) => delete next[k]);
    onChange(next);
  };

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={activeCount ? `All filters, ${activeCount} on` : 'All filters'}
          hitSlop={6}
          onPress={() => setSheet(all)}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="options-outline" size={24} color={colors.ink} />
          {activeCount ? (
            <Animated.View
              entering={appear}
              exiting={disappear}
              style={[styles.badge, { backgroundColor: colors.ink, borderColor: colors.surface }]}
            >
              <Text style={[styles.badgeText, { color: colors.surface }]}>{activeCount}</Text>
            </Animated.View>
          ) : null}
        </Pressable>

        {primary.map((key) => (
          <FilterChip
            key={key}
            name={FILTER_LABELS[key]}
            value={filters[key]}
            onPress={() => setSheet([key])}
            onClear={() => clear([key])}
          />
        ))}
        {more.length ? (
          <FilterChip
            name="More"
            value={moreCount ? `More · ${moreCount}` : undefined}
            onPress={() => setSheet(more)}
            onClear={() => clear(more)}
          />
        ) : null}

        {activeCount > 1 ? (
          <Animated.View entering={appear} exiting={disappear} layout={reflow}>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => clear(all)}
              style={({ pressed }) => [styles.clearAll, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[type.label, { color: colors.link }]}>Clear all</Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </ScrollView>

      <FilterSheet
        keys={sheet}
        filters={filters}
        resultCount={resultCount}
        onChange={onChange}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

/**
 * Outlined chip with a chevron when unset; ink-filled with an × when set.
 * `value` is what the chip shows when set (the chosen option).
 */
function FilterChip({
  name,
  value,
  onPress,
  onClear,
}: {
  name: string;
  value?: string;
  onPress: () => void;
  onClear: () => void;
}) {
  const colors = useBondColors();
  const active = !!value;
  const fg = active ? colors.surface : colors.ink;

  return (
    // Colour cross-fades (CSS transition); width changes reflow the row smoothly.
    <Animated.View
      layout={reflow}
      style={[
        styles.chip,
        styles.chipTransition,
        active
          ? { backgroundColor: colors.ink, borderColor: colors.ink }
          : { backgroundColor: colors.surfaceRaised, borderColor: colors.line },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={active ? `${name}: ${value}. Change` : `${name} filter`}
        onPress={onPress}
        style={({ pressed }) => [styles.chipMain, active && styles.chipMainActive, pressed && { opacity: 0.6 }]}
      >
        <Text numberOfLines={1} style={[type.label, styles.chipText, { color: fg }]}>
          {value ?? name}
        </Text>
        {active ? null : (
          <Animated.View entering={appear}>
            <Ionicons name="chevron-down" size={14} color={colors.inkMuted} />
          </Animated.View>
        )}
      </Pressable>
      {active ? (
        <Animated.View entering={appear} style={styles.fullHeight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Clear ${name}`}
            hitSlop={{ top: 6, bottom: 6, right: 6 }}
            onPress={onClear}
            style={({ pressed }) => [styles.chipClear, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="close" size={16} color={fg} />
          </Pressable>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

/**
 * Bottom sheet with two levels so it never shows every option at once:
 * several categories → one row each (name + current choice), tap to open;
 * one category → a plain list of its options with "Any" first and a tick.
 */
function FilterSheet({
  keys,
  filters,
  resultCount,
  onChange,
  onClose,
}: {
  keys: FilterKey[] | null;
  filters: Filters;
  resultCount?: number;
  onChange: (next: Filters) => void;
  onClose: () => void;
}) {
  const colors = useBondColors();
  // Industries follow the session's companies, so demo panel edits show up here.
  const { companies } = useCompanies();
  const options = useMemo(() => ({ ...FILTER_OPTIONS, industry: industriesOf(companies) }), [companies]);
  const visible = keys !== null;
  // Keep showing the last categories while the sheet slides away after closing.
  const [lastKeys, setLastKeys] = useState(keys);
  // The category opened from the overview, when the sheet was opened with several.
  const [opened, setOpened] = useState<FilterKey | null>(null);
  // Which way the last level change went; null until the user moves between levels,
  // so the first level doesn't slide in on top of the sheet's own entrance.
  const [direction, setDirection] = useState<'forward' | 'back' | null>(null);
  if (keys && keys !== lastKeys) {
    // Opened afresh: start at the top level.
    setLastKeys(keys);
    setOpened(null);
    setDirection(null);
  }
  const shown = keys ?? lastKeys ?? [];
  const current: FilterKey | null = shown.length === 1 ? shown[0] : opened;
  const canGoBack = shown.length > 1 && current !== null;
  const reduced = useReducedMotion();

  const openCategory = (key: FilterKey) => {
    setDirection('forward');
    setOpened(key);
  };
  const backToOverview = () => {
    setDirection('back');
    setOpened(null);
  };
  const close = onClose;

  const levelEntering =
    direction === null
      ? undefined
      : reduced
        ? FadeIn.duration(CHIP_MS)
        : (direction === 'forward' ? FadeInRight : FadeInLeft).duration(220).easing(EASE_OUT);

  const scope = current ? [current] : shown;
  const anyActive = scope.some((k) => filters[k]);
  const clearScope = () => {
    const next = { ...filters };
    scope.forEach((k) => delete next[k]);
    onChange(next);
  };

  const doneLabel =
    resultCount === undefined
      ? 'Done'
      : resultCount === 0
        ? 'No matches. Try fewer filters'
        : `Show ${resultCount} ${resultCount === 1 ? 'business' : 'businesses'}`;

  return (
    <BottomSheet visible={visible} onRequestClose={close}>
      <View style={styles.sheetHead}>
        {canGoBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="All filters"
            hitSlop={8}
            onPress={backToOverview}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </Pressable>
        ) : null}
        <Text accessibilityRole="header" style={[type.subheading, styles.flex, { color: colors.ink }]}>
          {current ? FILTER_LABELS[current] : 'Filters'}
        </Text>
        {anyActive ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={clearScope}>
            <Text style={[type.label, { color: colors.link }]}>{current ? 'Clear' : 'Clear all'}</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView style={styles.sheetBody}>
        {/* Keyed by level so each change re-enters: forward slides in from the right, back from the left. */}
        <Animated.View key={current ?? 'all'} entering={levelEntering}>
          {current ? (
            <View accessibilityRole="radiogroup" accessibilityLabel={FILTER_LABELS[current]}>
              {[undefined, ...options[current]].map((option, i, list) => {
                const selected = filters[current] === option;
                return (
                  <Pressable
                    key={option ?? 'any'}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => {
                      onChange({ ...filters, [current]: option });
                      if (shown.length > 1) backToOverview();
                    }}
                    style={({ pressed }) => [
                      styles.listRow,
                      i < list.length - 1 && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Text
                      style={[
                        selected ? type.label : type.body,
                        styles.flex,
                        { color: option ? colors.ink : colors.inkMuted },
                      ]}
                    >
                      {option ?? 'Any'}
                    </Text>
                    {selected ? (
                      <Animated.View entering={appear}>
                        <Ionicons name="checkmark" size={20} color={colors.ink} />
                      </Animated.View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            shown.map((key, i) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={`${FILTER_LABELS[key]}: ${filters[key] ?? 'Any'}`}
                onPress={() => openCategory(key)}
                style={({ pressed }) => [
                  styles.listRow,
                  i < shown.length - 1 && { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={[type.body, styles.flex, { color: colors.ink }]}>{FILTER_LABELS[key]}</Text>
                <Text
                  numberOfLines={1}
                  style={[filters[key] ? type.label : type.body, styles.rowValue, { color: filters[key] ? colors.ink : colors.inkMuted }]}
                >
                  {filters[key] ?? 'Any'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
              </Pressable>
            ))
          )}
        </Animated.View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={close}
        style={({ pressed }) => [styles.done, { backgroundColor: colors.ink, opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={[type.label, { color: colors.surface }]}>{doneLabel}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { gap: space[2], paddingHorizontal: space[4], alignItems: 'center' },
  iconButton: {
    width: CHIP_HEIGHT,
    height: CHIP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[1],
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CHIP_HEIGHT,
    maxWidth: 240,
    borderRadius: CHIP_HEIGHT / 2,
    borderWidth: 1,
  },
  chipMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    height: '100%',
    paddingHorizontal: space[3],
    flexShrink: 1,
  },
  fullHeight: { height: '100%' },
  chipTransition: {
    transitionProperty: ['backgroundColor', 'borderColor'],
    transitionDuration: CHIP_MS,
    transitionTimingFunction: 'ease-out',
  },
  chipMainActive: { paddingRight: space[1] },
  chipText: { flexShrink: 1 },
  chipClear: { height: '100%', paddingLeft: space[1], paddingRight: space[3], justifyContent: 'center' },
  clearAll: { height: CHIP_HEIGHT, justifyContent: 'center', paddingHorizontal: space[1] },
  sheetHead: { flexDirection: 'row', alignItems: 'center' },
  sheetBody: { flexGrow: 0 },
  back: { marginRight: space[2], marginLeft: -space[1] },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 52 },
  rowValue: { maxWidth: '50%' },
  done: { minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
