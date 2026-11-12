import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FILTER_LABELS, FILTER_OPTIONS, type FilterKey, type Filters } from '@/data/discover';
import { radius, space, type, useBondColors } from '@/theme/tokens';

const PRIMARY: FilterKey[] = ['location', 'industry'];
const MORE: FilterKey[] = ['size', 'identity', 'collaboration'];
const ALL: FilterKey[] = [...PRIMARY, ...MORE];

/**
 * Discover filter row: filter icon (all filters), Location, Industry, More…
 * (docs/bond-app-structure.md §1). Each opens a sheet of single-choice options.
 */
export function FilterBar({ filters, onChange }: { filters: Filters; onChange: (next: Filters) => void }) {
  const colors = useBondColors();
  const [sheet, setSheet] = useState<FilterKey[] | null>(null);
  const activeCount = Object.values(filters).filter(Boolean).length;
  const moreCount = MORE.filter((k) => filters[k]).length;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={activeCount ? `All filters, ${activeCount} on` : 'All filters'}
          onPress={() => setSheet(ALL)}
          style={({ pressed }) => [
            styles.iconChip,
            { borderColor: colors.line, backgroundColor: colors.surfaceRaised, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="options-outline" size={18} color={colors.ink} />
          {activeCount ? (
            <View style={[styles.count, { backgroundColor: colors.focusRing }]}>
              <Text style={[type.caption, { color: colors.surfaceRaised }]}>{activeCount}</Text>
            </View>
          ) : null}
        </Pressable>
        {PRIMARY.map((key) => (
          <FilterChip
            key={key}
            label={filters[key] ?? FILTER_LABELS[key]}
            active={!!filters[key]}
            onPress={() => setSheet([key])}
          />
        ))}
        <FilterChip
          label={moreCount ? `More (${moreCount})` : 'More…'}
          active={moreCount > 0}
          onPress={() => setSheet(MORE)}
        />
      </ScrollView>

      <FilterSheet
        keys={sheet}
        filters={filters}
        onChange={onChange}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useBondColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active
          ? { backgroundColor: colors.accent, borderColor: colors.accent }
          : { backgroundColor: colors.surfaceRaised, borderColor: colors.line },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text numberOfLines={1} style={[type.label, { color: active ? colors.onAccent : colors.ink }]}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={14} color={active ? colors.onAccent : colors.inkMuted} />
    </Pressable>
  );
}

function FilterSheet({
  keys,
  filters,
  onChange,
  onClose,
}: {
  keys: FilterKey[] | null;
  filters: Filters;
  onChange: (next: Filters) => void;
  onClose: () => void;
}) {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const shown = keys ?? [];
  const title = shown.length === 1 ? FILTER_LABELS[shown[0]] : 'Filters';
  const anyShownActive = shown.some((k) => filters[k]);

  const clearShown = () => {
    const next = { ...filters };
    shown.forEach((k) => delete next[k]);
    onChange(next);
  };

  return (
    <Modal visible={keys !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close filters" style={styles.backdrop} onPress={onClose} />
      <View
        style={[styles.sheet, { backgroundColor: colors.surfaceRaised, paddingBottom: Math.max(insets.bottom, space[4]) }]}
      >
        <View style={styles.sheetHead}>
          <Text accessibilityRole="header" style={[type.subheading, styles.flex, { color: colors.ink }]}>
            {title}
          </Text>
          {anyShownActive ? (
            <Pressable accessibilityRole="button" hitSlop={8} onPress={clearShown}>
              <Text style={[type.label, { color: colors.link }]}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView style={styles.sheetBody} contentContainerStyle={styles.groups}>
          {shown.map((key) => (
            <View key={key} style={styles.group}>
              {shown.length > 1 ? (
                <Text style={[type.label, { color: colors.inkMuted }]}>{FILTER_LABELS[key]}</Text>
              ) : null}
              <View accessibilityRole="radiogroup" accessibilityLabel={FILTER_LABELS[key]} style={styles.options}>
                {FILTER_OPTIONS[key].map((option) => {
                  const selected = filters[key] === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => onChange({ ...filters, [key]: selected ? undefined : option })}
                      style={[
                        styles.option,
                        selected
                          ? { backgroundColor: colors.accent, borderColor: colors.accent }
                          : { backgroundColor: colors.surfaceRaised, borderColor: colors.line },
                      ]}
                    >
                      <Text style={[type.label, { color: selected ? colors.onAccent : colors.ink }]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [styles.done, { backgroundColor: colors.ink, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={[type.label, { color: colors.surface }]}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { gap: space[2], paddingHorizontal: space[4], alignItems: 'center' },
  iconChip: {
    width: 40,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    height: 36,
    maxWidth: 220,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    borderWidth: 1,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(33, 36, 69, 0.4)' },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: space[4],
    paddingTop: space[4],
    gap: space[3],
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center' },
  sheetBody: { flexGrow: 0 },
  groups: { gap: space[4] },
  group: { gap: space[2] },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  option: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: space[3],
    minHeight: 40,
    justifyContent: 'center',
  },
  done: { minHeight: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
