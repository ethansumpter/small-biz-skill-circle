import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NewProposalForm } from '@/components/proposals/new-proposal-form';
import { StackHeader } from '@/components/stack-header';
import { formatLimit } from '@/data/plans';
import { type ProposalInput, useProposals } from '@/state/preview';
import { space, type, useBondColors } from '@/theme/tokens';

/**
 * The ＋ New Proposal form on its own page (docs/new-proposal-section-mockup.png:
 * the tab lists your proposals, "＋ New proposal" opens the form). Posting adds
 * it for this session and goes back to the list, which confirms it.
 */
export default function ComposeProposalScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const { proposals, canAdd, addProposal, maxActiveProposals } = useProposals();

  const handleSubmit = (input: ProposalInput) => {
    addProposal(input);
    // Back to the tab, telling it a post just happened so it shows the confirmation.
    router.dismissTo({ pathname: '/new-proposal', params: { posted: String(Date.now()) } });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <StackHeader
        title="New proposal"
        subtitle={`${proposals.length} of ${formatLimit(maxActiveProposals)} active`}
      />
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space[6] }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={[type.body, { color: colors.inkMuted }]}>
          Say what you need and what you can give back. Other businesses see it first on your Discover card.
        </Text>
        {canAdd ? (
          <NewProposalForm onSubmit={handleSubmit} />
        ) : (
          <Text style={[type.body, { color: colors.ink }]}>
            You already have {maxActiveProposals} active proposals, the most you can have at once. Close one before
            posting another.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: space[4], gap: space[6], width: '100%', maxWidth: 720, alignSelf: 'center' },
});
