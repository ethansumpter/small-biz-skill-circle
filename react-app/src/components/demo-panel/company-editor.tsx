import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CompanyAvatar } from '@/components/company-avatar';
import { ObjectFields } from '@/components/demo-panel/json-field';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import type { Json } from '@/utils/json-diff';

export type CompanyRecord = { id: string; [key: string]: Json };

/** One demo company as a collapsible card. Every field is editable except its id. */
export const CompanyEditor = memo(function CompanyEditor({
  company,
  original,
  changeCount,
  expanded,
  isCurrentUser,
  onToggle,
  onChange,
}: {
  company: CompanyRecord;
  original: CompanyRecord;
  changeCount: number;
  expanded: boolean;
  isCurrentUser: boolean;
  onToggle: (id: string) => void;
  onChange: (next: CompanyRecord) => void;
}) {
  const colors = useBondColors();
  const name = typeof company.name === 'string' && company.name ? company.name : company.id;
  const subtitle = [company.id, company.industry, company.location].filter(Boolean).join(' · ');

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${name}${changeCount ? `, ${changeCount} unsaved changes` : ''}`}
        onPress={() => onToggle(company.id)}
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.7 }]}
      >
        <CompanyAvatar companyId={company.id} size={44} />
        <View style={styles.titles}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={[type.label, styles.name, { color: colors.ink }]}>
              {name}
            </Text>
            {isCurrentUser ? (
              <View style={[styles.tag, { backgroundColor: colors.accent }]}>
                <Text style={[type.caption, { color: colors.onAccent }]}>Logged in</Text>
              </View>
            ) : null}
          </View>
          <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
            {subtitle}
          </Text>
        </View>
        {changeCount ? (
          <View style={[styles.badge, { backgroundColor: colors.focusRing }]}>
            <Text style={[type.caption, { color: colors.surfaceRaised }]}>{changeCount}</Text>
          </View>
        ) : null}
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.inkMuted} />
      </Pressable>

      {expanded ? (
        <View style={[styles.body, { borderTopColor: colors.line }]}>
          <ObjectFields
            value={company}
            original={original}
            onChange={(next) => onChange(next as CompanyRecord)}
          />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3] },
  titles: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  name: { flexShrink: 1 },
  tag: { borderRadius: radius.full, paddingHorizontal: space[2], paddingVertical: 1 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: radius.full,
    paddingHorizontal: space[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: space[4], borderTopWidth: StyleSheet.hairlineWidth },
});
