import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardMenu } from '@/components/discover/card-menu';
import { DiscoverCard } from '@/components/discover/discover-card';
import { LikeSheet } from '@/components/discover/like-sheet';
import { StackHeader } from '@/components/stack-header';
import { useCompanies, useDiscover, usePlans } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/**
 * The full profile behind a Discover overview card (docs/bond-app-structure.md §1):
 * the whole Discover card, with ✕ Pass · Save · Send like at the bottom. Pass
 * and Block go back to Discover, which shows the next company.
 */
export default function DiscoverProfileScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { companies } = useCompanies();
  const { sent, saved, passCompany, toggleSaved, sendLike, blockCompany } = useDiscover();
  const { likesPerDay } = usePlans();
  const company = companies.find((c) => c.id === id);

  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [proposalType, setProposalType] = useState<string | undefined>();
  const [sentNote, setSentNote] = useState<string | null>(null);

  if (!company) {
    return (
      <View style={[styles.root, { backgroundColor: colors.surface }]}>
        <StackHeader title="Discover" />
        <View style={styles.missing}>
          <Text style={[type.body, { color: colors.ink }]}>This business isn't on Discover any more.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <Text style={[type.label, { color: colors.link }]}>Back to Discover</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isSaved = saved.includes(company.id);
  const openSheet = () => setSheetOpen(true);

  const send = (comment: string) => {
    sendLike({ companyId: company.id, comment, proposalType });
    setSheetOpen(false);
    setSentNote(
      `${proposalType ? `${proposalType} proposal` : 'Like'} saved for ${company.name}. Preview only: nothing is sent.`,
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <StackHeader title={company.name} subtitle="Discover" />

      <ScrollView contentContainerStyle={styles.content}>
        <DiscoverCard
          company={company}
          proposalType={proposalType}
          onProposalType={setProposalType}
          onOpenMenu={() => setMenuOpen(true)}
          // No comment bubble or 👍 here: the bottom bar's Send button sends the like/proposal.
          canPropose={!sentNote}
        />
      </ScrollView>

      <View
        style={[
          styles.bar,
          { paddingBottom: insets.bottom + space[3], backgroundColor: colors.surfaceRaised, borderTopColor: colors.line },
        ]}
      >
        {sentNote ? (
          <>
            <Text style={[type.label, styles.flex, { color: colors.ink }]}>{sentNote}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.primary, { backgroundColor: colors.ink, opacity: pressed ? 0.85 : 1 }]}
            >
              <Text style={[type.label, { color: colors.surface }]}>Next business</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Pass on ${company.name}`}
              onPress={() => {
                passCompany(company.id);
                router.back();
              }}
              style={({ pressed }) => [
                styles.round,
                { borderColor: colors.line, backgroundColor: colors.surfaceRaised, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close" size={26} color={colors.ink} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isSaved ? `Remove ${company.name} from saved` : `Save ${company.name} for later`}
              accessibilityState={{ selected: isSaved }}
              onPress={() => toggleSaved(company.id)}
              style={({ pressed }) => [
                styles.round,
                isSaved
                  ? { borderColor: colors.accent, backgroundColor: colors.accent }
                  : { borderColor: colors.line, backgroundColor: colors.surfaceRaised },
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isSaved ? colors.onAccent : colors.ink}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityHint="Opens a sheet to add the required comment"
              onPress={openSheet}
              style={({ pressed }) => [styles.primary, styles.flex, { backgroundColor: colors.ink, opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons name="thumbs-up" size={20} color={colors.surface} />
              <Text style={[type.label, { color: colors.surface }]}>{proposalType ? 'Send proposal' : 'Send like'}</Text>
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
          blockCompany(company.id);
          router.back();
        }}
        onReport={() => {
          setMenuOpen(false);
          notInPreview('Report');
        }}
      />
      <LikeSheet
        company={company}
        visible={sheetOpen}
        proposalType={proposalType}
        onProposalType={setProposalType}
        likesLeft={Math.max(0, likesPerDay - sent.length)}
        onClose={() => setSheetOpen(false)}
        onSend={send}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: space[4], paddingBottom: space[12], width: '100%', maxWidth: 720, alignSelf: 'center' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3], padding: space[4] },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  round: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    flexDirection: 'row',
    gap: space[2],
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
