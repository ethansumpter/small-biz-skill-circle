import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CompanyAvatar } from '@/components/company-avatar';
import { radius, space, type, useBondColors } from '@/theme/tokens';

/**
 * Shared pieces of the demo panel's editors (companies, proposals, chats): a
 * list row, the detail frame with previous/next navigation, and section tabs.
 */

/** One or two company logos; a pair overlaps (e.g. the partners in a proposal). */
function Avatars({ ids, size }: { ids: string[]; size: number }) {
  const colors = useBondColors();
  if (ids.length < 2) return ids[0] ? <CompanyAvatar companyId={ids[0]} size={size} /> : null;
  const small = Math.round(size * 0.72);
  return (
    <View style={{ width: size, height: size }}>
      <CompanyAvatar companyId={ids[0]} size={small} />
      <View style={[styles.second, { borderColor: colors.surfaceRaised, borderRadius: radius.full }]}>
        <CompanyAvatar companyId={ids[1]} size={small} />
      </View>
    </View>
  );
}

// ── List row ─────────────────────────────────────────────────────────────────

export const ItemRow = memo(function ItemRow({
  id,
  avatarIds,
  title,
  subtitle,
  tag,
  changeCount,
  selected,
  onPress,
}: {
  id: string;
  avatarIds: string[];
  title: string;
  subtitle: string;
  tag?: string;
  changeCount: number;
  selected: boolean;
  onPress: (id: string) => void;
}) {
  const colors = useBondColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Edit ${title}${changeCount ? `, ${changeCount} unsaved changes` : ''}${tag ? `, ${tag}` : ''}`}
      onPress={() => onPress(id)}
      style={({ pressed }) => [
        styles.row,
        { borderColor: selected ? colors.focusRing : colors.line, backgroundColor: colors.surfaceRaised },
        selected && styles.rowSelected,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Avatars ids={avatarIds} size={36} />
      <View style={styles.titles}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[type.label, styles.shrink, { color: colors.ink }]}>
            {title}
          </Text>
          {tag ? <Tag text={tag} /> : null}
        </View>
        <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
          {subtitle}
        </Text>
      </View>
      {changeCount ? <Badge count={changeCount} /> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
});

// ── Detail frame ─────────────────────────────────────────────────────────────

export function DetailShell({
  avatarIds,
  title,
  subtitle,
  tag,
  changeCount,
  position,
  backLabel,
  onDiscard,
  onBack,
  onPrev,
  onNext,
  children,
}: {
  avatarIds: string[];
  title: string;
  subtitle: string;
  tag?: string;
  /** Unsaved changes to this item; shows Discard when there are any. */
  changeCount: number;
  /** e.g. "3 of 18" within the current filter. */
  position: string;
  backLabel: string;
  onDiscard: () => void;
  /** Only on narrow screens, where the list and the detail take turns. */
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  children: ReactNode;
}) {
  const colors = useBondColors();
  return (
    <View style={styles.detail}>
      <View style={styles.navRow}>
        {onBack ? <NavButton icon="arrow-back" label={backLabel} onPress={onBack} /> : <View style={styles.shrink} />}
        <View style={styles.navEnd}>
          <Text style={[type.caption, { color: colors.inkMuted }]}>{position}</Text>
          <NavButton icon="chevron-back" accessibilityLabel="Previous" onPress={onPrev} />
          <NavButton icon="chevron-forward" accessibilityLabel="Next" onPress={onNext} />
        </View>
      </View>

      <View style={[styles.hero, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }]}>
        <Avatars ids={avatarIds} size={56} />
        <View style={styles.titles}>
          <View style={styles.nameRow}>
            <Text accessibilityRole="header" numberOfLines={2} style={[type.subheading, styles.shrink, { color: colors.ink }]}>
              {title}
            </Text>
            {tag ? <Tag text={tag} /> : null}
          </View>
          <Text numberOfLines={2} style={[type.caption, { color: colors.inkMuted }]}>
            {subtitle}
          </Text>
        </View>
        {changeCount ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Discard ${changeCount} unsaved changes to ${title}`}
            hitSlop={8}
            onPress={onDiscard}
          >
            <Text style={[type.label, { color: colors.link }]}>Discard</Text>
          </Pressable>
        ) : null}
      </View>

      {children}
    </View>
  );
}

/** A white card holding an editor's fields. */
export function FieldsCard({ children }: { children: ReactNode }) {
  const colors = useBondColors();
  return (
    <View style={[styles.body, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }]}>{children}</View>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

export function Tabs({
  tabs,
  value,
  onChange,
  label,
  wrap = false,
}: {
  tabs: { key: string; title: string; count?: number }[];
  value: string;
  onChange: (key: string) => void;
  label: string;
  /** Wrap onto more lines instead of scrolling sideways (so every tab stays visible). */
  wrap?: boolean;
}) {
  const colors = useBondColors();
  const Container = wrap ? View : ScrollView;
  return (
    <Container
      {...(wrap ? {} : { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles.tabs })}
    >
      <View accessibilityRole="tablist" accessibilityLabel={label} style={[styles.tabs, wrap && styles.tabsWrap]}>
        {tabs.map((t) => {
          const active = t.key === value;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${t.title}${t.count ? `, ${t.count} unsaved changes` : ''}`}
              onPress={() => onChange(t.key)}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: active ? colors.ink : colors.surfaceRaised,
                  borderColor: active ? colors.ink : colors.line,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[type.label, { color: active ? colors.surface : colors.ink }]}>{t.title}</Text>
              {t.count ? <Badge count={t.count} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Container>
  );
}

// ── Small parts ──────────────────────────────────────────────────────────────

export function NavButton({
  icon,
  label,
  accessibilityLabel,
  onPress,
  tone = 'default',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  accessibilityLabel?: string;
  onPress?: () => void;
  tone?: 'default' | 'link';
}) {
  const colors = useBondColors();
  const color = tone === 'link' ? colors.link : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        { borderColor: colors.line, opacity: !onPress ? 0.35 : pressed ? 0.6 : 1 },
      ]}
    >
      <Ionicons name={icon} size={18} color={color} />
      {label ? <Text style={[type.label, { color }]}>{label}</Text> : null}
    </Pressable>
  );
}

export function Tag({ text }: { text: string }) {
  const colors = useBondColors();
  return (
    <View style={[styles.tag, { backgroundColor: colors.accent }]}>
      <Text style={[type.caption, { color: colors.onAccent }]}>{text}</Text>
    </View>
  );
}

export function Badge({ count }: { count: number }) {
  const colors = useBondColors();
  return (
    <View style={[styles.badge, { backgroundColor: colors.focusRing }]}>
      <Text style={[type.caption, { color: colors.surfaceRaised }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  titles: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  second: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  rowSelected: { borderWidth: 2 },
  detail: { gap: space[4] },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  navEnd: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center',
    paddingHorizontal: space[2],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabs: { flexDirection: 'row', gap: space[2] },
  tabsWrap: { flexWrap: 'wrap' },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: 40,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    borderWidth: 1,
  },
  body: { padding: space[4], borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, gap: space[3] },
  tag: { borderRadius: radius.full, paddingHorizontal: space[2], paddingVertical: 1 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: radius.full,
    paddingHorizontal: space[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
