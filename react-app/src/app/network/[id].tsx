import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardMenu } from '@/components/discover/card-menu';
import { DiscoverCard } from '@/components/discover/discover-card';
import { LikeSheet } from '@/components/discover/like-sheet';
import { StackHeader } from '@/components/stack-header';
import { FREE_LIKES_PER_DAY } from '@/data/discover';
import { useCompanies, useDiscover, useNetwork } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/**
 * A company from Your Network, laid out like Discover
 * (docs/your-network-section-mockup.png). Proposals show their comment as a
 * chat bubble at the top with Accept / ✕; accepting opens a chat in Leads.
 * Saved companies can be sent a like or proposal from the card, as on Discover.
 */
export default function NetworkProfileScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incoming, saved, acceptProposal, rejectProposal, toggleSaved } = useNetwork();
  const { sent, sendLike, blockCompany } = useDiscover();
  const { companies } = useCompanies();

  // Snapshot on open, so the page doesn't flash "not found" while leaving after Accept/Reject.
  const [proposal] = useState(() => incoming.find((p) => p.companyId === id));
  const [wasSaved] = useState(() => saved.includes(id));
  const company = companies.find((c) => c.id === id);

  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [proposalType, setProposalType] = useState<string | undefined>();
  const [sentNote, setSentNote] = useState<string | null>(null);

  if (!company || (!proposal && !wasSaved)) {
    return (
      <View style={[styles.root, { backgroundColor: colors.surface }]}>
        <StackHeader title="Your Network" />
        <View style={styles.missing}>
          <Text style={[type.body, { color: colors.ink }]}>This business is no longer in your network.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <Text style={[type.label, { color: colors.link }]}>Back to Your Network</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const accept = () => {
    acceptProposal(company.id);
    router.replace({ pathname: '/leads/[id]', params: { id: company.id } });
  };

  const reject = () => {
    rejectProposal(company.id);
    router.back();
  };

  const send = (comment: string) => {
    sendLike({ companyId: company.id, comment, proposalType });
    if (saved.includes(company.id)) toggleSaved(company.id);
    setSheetOpen(false);
    setSentNote(
      `${proposalType ? `${proposalType} proposal` : 'Like'} saved for ${company.name}. Preview only: nothing is sent.`,
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <StackHeader title={company.name} subtitle={proposal ? 'Proposed to you' : 'Saved'} />

      <ScrollView contentContainerStyle={styles.content}>
        {proposal ? (
          // Their proposal as a chat bubble, from them (mockup).
          <View style={styles.bubbleWrap}>
            <View
              style={[
                styles.bubble,
                { backgroundColor: colors.surfaceRaised, borderColor: colors.line, borderBottomLeftRadius: radius.sm },
              ]}
            >
              <View style={styles.bubbleHead}>
                <Ionicons name="chatbubble-ellipses" size={16} color={colors.inkMuted} />
                <Text style={[type.caption, { color: colors.inkMuted }]}>Their proposal</Text>
              </View>
              <Text style={[type.subheading, { color: colors.ink }]}>{proposal.title}</Text>
              <Text style={[type.body, { color: colors.ink }]}>{proposal.comment}</Text>
            </View>
          </View>
        ) : null}

        <DiscoverCard
          company={company}
          proposalType={proposalType}
          onProposalType={setProposalType}
          onOpenMenu={() => setMenuOpen(true)}
          {...(!proposal && !sentNote
            ? { onComment: () => setSheetOpen(true), onSendProposal: () => setSheetOpen(true) }
            : {})}
        />
      </ScrollView>

      {/* Bottom actions */}
      <View
        style={[
          styles.bar,
          { paddingBottom: insets.bottom + space[3], backgroundColor: colors.surfaceRaised, borderTopColor: colors.line },
        ]}
      >
        {proposal ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Reject ${company.name}'s proposal`}
              onPress={reject}
              style={({ pressed }) => [
                styles.reject,
                { borderColor: colors.line, backgroundColor: colors.surfaceRaised, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close" size={26} color={colors.ink} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityHint="Matches you and opens a chat in Leads"
              onPress={accept}
              style={({ pressed }) => [styles.accept, { backgroundColor: colors.ink, opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons name="checkmark" size={22} color={colors.surface} />
              <Text style={[type.label, { color: colors.surface }]}>Accept</Text>
            </Pressable>
          </>
        ) : sentNote ? (
          <Text style={[type.label, styles.flex, { color: colors.ink }]}>{sentNote}</Text>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                toggleSaved(company.id);
                router.back();
              }}
              style={({ pressed }) => [
                styles.secondary,
                styles.flex,
                { borderColor: colors.line, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="bookmark" size={18} color={colors.ink} />
              <Text style={[type.label, { color: colors.ink }]}>Remove from saved</Text>
            </Pressable>
          </>
        )}
      </View>

      <CardMenu
        visible={menuOpen}
        companyName={company.name}
        onClose={() => setMenuOpen(false)}
        onBlock={() => {
          setMenuOpen(false);
          if (proposal) rejectProposal(company.id);
          blockCompany(company.id);
          router.back();
        }}
        onReport={() => {
          setMenuOpen(false);
          notInPreview('Report');
        }}
      />
      {!proposal ? (
        <LikeSheet
          company={company}
          visible={sheetOpen}
          proposalType={proposalType}
          onProposalType={setProposalType}
          likesLeft={Math.max(0, FREE_LIKES_PER_DAY - sent.length)}
          onClose={() => setSheetOpen(false)}
          onSend={send}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: space[4], gap: space[4], paddingBottom: space[12], width: '100%', maxWidth: 720, alignSelf: 'center' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3], padding: space[4] },
  bubbleWrap: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '92%',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space[4],
    gap: space[2],
  },
  bubbleHead: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  reject: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accept: {
    flex: 1,
    flexDirection: 'row',
    gap: space[2],
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    flexDirection: 'row',
    gap: space[2],
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
