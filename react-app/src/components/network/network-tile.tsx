import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CompanyAvatar } from '@/components/company-avatar';
import type { Company } from '@/data/companies';
import { radius, space, type, useBondColors } from '@/theme/tokens';

/**
 * One tile in the Your Network grid (docs/your-network-section-mockup.png).
 * Proposals carry a chat-bubble badge; saved companies a bookmark.
 */
export function NetworkTile({
  company,
  kind,
  snippet,
  width,
  onPress,
}: {
  company: Company;
  kind: 'proposal' | 'saved';
  /** Proposal title, shown under the company name. */
  snippet?: string;
  width: number;
  onPress: () => void;
}) {
  const colors = useBondColors();
  const proposal = kind === 'proposal';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${company.name}, ${proposal ? `proposed: ${snippet}` : 'saved'}`}
      accessibilityHint="Opens their profile"
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width, backgroundColor: colors.surfaceRaised, borderColor: colors.line, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.art, { backgroundColor: colors.accent }]}>
        <CompanyAvatar companyId={company.id} size={Math.min(88, width * 0.5)} />
        <View style={[styles.badge, { backgroundColor: proposal ? colors.ink : colors.surfaceRaised }]}>
          <Ionicons
            name={proposal ? 'chatbubble-ellipses' : 'bookmark'}
            size={16}
            color={proposal ? colors.surface : colors.ink}
          />
        </View>
      </View>
      <View style={styles.text}>
        <Text numberOfLines={2} style={[type.label, { color: colors.ink }]}>
          {company.name}
        </Text>
        <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
          {company.industry}
        </Text>
        {snippet ? (
          <Text numberOfLines={2} style={[type.caption, styles.snippet, { color: colors.ink }]}>
            “{snippet}”
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  art: { aspectRatio: 1.15, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: space[2],
    right: space[2],
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { padding: space[3], gap: 2 },
  snippet: { marginTop: space[1] },
});
