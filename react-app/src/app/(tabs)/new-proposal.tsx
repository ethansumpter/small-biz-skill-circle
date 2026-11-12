import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentRef, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AI_BUTTON_CLEARANCE } from '@/components/ai-assistant-button';
import { NewProposalForm } from '@/components/proposals/new-proposal-form';
import { ProposalCard } from '@/components/proposals/proposal-card';
import { Card, SectionTitle } from '@/components/ui';
import { MAX_ACTIVE_PROPOSALS } from '@/data/plans';
import { type ProposalInput, useProposals } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';

export default function NewProposalScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const { proposals, canAdd, addProposal } = useProposals();
  const [justPosted, setJustPosted] = useState(false);

  const handleSubmit = (input: ProposalInput) => {
    addProposal(input);
    setJustPosted(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ backgroundColor: colors.surface }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4] }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[type.heading, { color: colors.ink }]}>
          New proposal
        </Text>
        <Text style={[type.body, { color: colors.inkMuted }]}>
          Say what you need and what you can give back. Other businesses see it first on your Discover card.
        </Text>
      </View>

      {justPosted ? (
        <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: colors.accent }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.onAccent} />
          <Text style={[type.label, styles.noticeText, { color: colors.onAccent }]}>
            Proposal added. This is a preview, so it isn't shared with anyone and resets when the app reloads.
          </Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionTitle>
          Your active proposals ({proposals.length} of {MAX_ACTIVE_PROPOSALS})
        </SectionTitle>
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </View>

      {canAdd ? (
        <NewProposalForm onSubmit={handleSubmit} />
      ) : (
        <Card>
          <Text style={[type.subheading, { color: colors.ink }]}>You have {MAX_ACTIVE_PROPOSALS} active proposals</Text>
          <Text style={[type.body, { color: colors.inkMuted }]}>
            That's the most you can have at once. Close one before posting another.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space[4],
    paddingBottom: AI_BUTTON_CLEARANCE,
    gap: space[6],
  },
  intro: { gap: space[2] },
  section: { gap: space[3] },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
    padding: space[3],
    borderRadius: radius.md,
  },
  noticeText: { flex: 1 },
});
