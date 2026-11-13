import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CompanyAvatar } from '@/components/company-avatar';
import type { Lead } from '@/data/demo-leads';
import { useCompanies } from '@/state/preview';
import { space, type, useBondColors } from '@/theme/tokens';

/** One matched company in the Leads list: company, then its owner's name (shown once matched), then the latest message. */
export function LeadRow({ lead, last }: { lead: Lead; last?: boolean }) {
  const colors = useBondColors();
  const { getCompany } = useCompanies();
  // Looked up live so demo panel edits show straight away.
  const owner = getCompany(lead.id).ownerName;
  const latest = lead.messages.at(-1);
  const preview = latest
    ? `${latest.from === 'me' ? 'You: ' : ''}${latest.attachment ? `${latest.text} (${latest.attachment})` : latest.text}`
    : 'New match. Say hello.';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${lead.company}${owner ? `, ${owner}` : ''}. ${preview}`}
      onPress={() => router.push({ pathname: '/leads/[id]', params: { id: lead.id } })}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
        pressed && { opacity: 0.6 },
      ]}
    >
      <CompanyAvatar companyId={lead.id} size={52} />
      <View style={styles.text}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[type.subheading, styles.name, { color: colors.ink }]}>
            {lead.company}
          </Text>
          {lead.muted ? <Ionicons name="notifications-off-outline" size={16} color={colors.inkMuted} /> : null}
        </View>
        {owner ? (
          <Text numberOfLines={1} style={[type.caption, { color: colors.inkMuted }]}>
            {owner}
          </Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={[latest ? type.body : type.label, { color: latest ? colors.inkMuted : colors.link }]}
        >
          {preview}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
  },
  text: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  name: { flexShrink: 1 },
});
