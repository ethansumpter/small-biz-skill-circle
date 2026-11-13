import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useBottomClearance } from '@/components/ai-assistant-button';
import { LeadRow } from '@/components/leads/lead-row';
import { Card } from '@/components/ui';
import { useLeads } from '@/state/preview';
import { space, type, useBondColors } from '@/theme/tokens';

export default function LeadsScreen() {
  const colors = useBondColors();
  const bottomClearance = useBottomClearance();
  const { leads } = useLeads();

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: bottomClearance }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: space[4],
    paddingTop: space[4],
    gap: space[6],
  },
  intro: { gap: space[2] },
  list: { paddingVertical: 0, gap: 0 },
});
