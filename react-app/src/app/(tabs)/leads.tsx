import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeadRow } from '@/components/leads/lead-row';
import { Card } from '@/components/ui';
import { useLeads } from '@/state/preview';
import { space, type, useBondColors } from '@/theme/tokens';

export default function LeadsScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const { leads } = useLeads();

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4] }]}
    >
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[type.heading, { color: colors.ink }]}>
          Leads
        </Text>
        <Text style={[type.body, { color: colors.inkMuted }]}>Businesses you've matched with.</Text>
      </View>

      {leads.length > 0 ? (
        <Card style={styles.list}>
          {leads.map((lead, i) => (
            <LeadRow key={lead.id} lead={lead} last={i === leads.length - 1} />
          ))}
        </Card>
      ) : (
        <Card>
          <Text style={[type.subheading, { color: colors.ink }]}>No matches yet</Text>
          <Text style={[type.body, { color: colors.inkMuted }]}>
            When a business accepts your proposal, or you accept theirs, you can talk here.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space[4],
    paddingBottom: space[12],
    gap: space[6],
  },
  intro: { gap: space[2] },
  list: { paddingVertical: 0, gap: 0 },
});
