import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import type { Proposal } from '@/state/proposals';
import { radius, space, type, useBondColors } from '@/theme/tokens';

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const colors = useBondColors();

  return (
    <Card>
      <View style={styles.top}>
        <Text style={[type.subheading, styles.title, { color: colors.ink }]}>{proposal.title}</Text>
        <View style={[styles.status, { borderColor: colors.line }]}>
          <Text style={[type.caption, { color: colors.inkMuted }]}>{proposal.status}</Text>
        </View>
      </View>
      {proposal.meta ? <Text style={[type.caption, { color: colors.inkMuted }]}>{proposal.meta}</Text> : null}
      <Text style={[type.body, { color: colors.ink }]}>{proposal.summary}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  title: { flex: 1 },
  status: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: space[2],
    paddingVertical: 2,
  },
});
