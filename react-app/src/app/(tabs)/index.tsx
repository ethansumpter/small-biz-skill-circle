import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useBottomClearance } from '@/components/ai-assistant-button';
import { FilterBar } from '@/components/discover/filter-bar';
import { LikeSheet } from '@/components/discover/like-sheet';
import { SwipeDeck } from '@/components/discover/swipe-deck';
import { Card, PrimaryButton } from '@/components/ui';
import { DISCOVER_ORDER, type Filters, matchesFilters } from '@/data/discover';
import { useCompanies, useCurrentUser, useDemoProposals, useDiscover, usePlans } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';

/**
 * Discover: one company at a time as a swipeable overview card
 * (docs/bond-app-structure.md §1). Swipe right to like, left to pass; tap the
 * card for the full profile at /discover/[id]. A like still needs a comment, so
 * swiping right opens the like sheet and the card comes back if it's closed
 * without sending.
 */
export default function DiscoverScreen() {
  const colors = useBondColors();
  const bottomClearance = useBottomClearance();
  const { currentUserId } = useCurrentUser();
  const { getCompany } = useCompanies();
  const { demoProposals } = useDemoProposals();
  const { passed, sent, blocked, passCompany, sendLike, restartDiscover } = useDiscover();

  const [filters, setFilters] = useState<Filters>({});
  const [proposalType, setProposalType] = useState<string | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [returnToken, setReturnToken] = useState(0);

  const remaining = useMemo(() => {
    const done = new Set([...passed, ...blocked, ...sent.map((s) => s.companyId), currentUserId]);
    return DISCOVER_ORDER.filter((id) => !done.has(id)).map(getCompany);
  }, [passed, blocked, sent, currentUserId, getCompany]);
  const feed = useMemo(
    () => remaining.filter((c) => matchesFilters(c, filters, demoProposals)),
    [remaining, filters, demoProposals],
  );
  const company = feed[0];
  const { likesPerDay } = usePlans();
  const likesLeft = Math.max(0, likesPerDay - sent.length);

  // New company: no proposal type picked.
  useEffect(() => {
    setProposalType(undefined);
  }, [company?.id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const send = (comment: string) => {
    if (!company) return;
    sendLike({ companyId: company.id, comment, proposalType });
    setSheetOpen(false);
    setToast(
      `${proposalType ? `${proposalType} proposal` : 'Like'} saved for ${company.name}. Preview only: nothing is sent.`,
    );
  };

  const closeSheet = () => {
    setSheetOpen(false);
    // Swiped right but didn't send: bring the card back.
    setReturnToken((n) => n + 1);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      {/* Filter row stays put under the top bar */}
      <View style={[styles.filters, { borderBottomColor: colors.line }]}>
        <FilterBar filters={filters} onChange={setFilters} resultCount={feed.length} aiMatching />
        {company ? (
          <Text style={[type.caption, styles.count, { color: colors.inkMuted }]}>
            {feed.length} {feed.length === 1 ? 'business' : 'businesses'} to see
          </Text>
        ) : null}
      </View>

      {company ? (
        <View style={[styles.stage, { paddingBottom: bottomClearance }]}>
          <SwipeDeck
            top={company}
            next={feed[1]}
            returnToken={returnToken}
            onOpen={(c) => router.push({ pathname: '/discover/[id]', params: { id: c.id } })}
            onSwipe={(c, direction) => {
              if (direction === 'left') passCompany(c.id);
              else setSheetOpen(true);
            }}
          />
          <LikeSheet
            company={company}
            visible={sheetOpen}
            proposalType={proposalType}
            onProposalType={setProposalType}
            likesLeft={likesLeft}
            onClose={closeSheet}
            onSend={send}
          />
        </View>
      ) : (
        <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: bottomClearance }]}>
          {remaining.length > 0 ? (
            <EmptyState
              icon="funnel-outline"
              title="No businesses match these filters"
              body="Try fewer filters to see more of Leeds."
              action="Clear filters"
              onAction={() => setFilters({})}
            />
          ) : (
            <EmptyState
              icon="checkmark-done-outline"
              title="You've seen everyone for now"
              body={
                passed.length
                  ? `You passed on ${passed.length} ${passed.length === 1 ? 'business' : 'businesses'}. You can look at them again.`
                  : 'New businesses will show up here as they join.'
              }
              action={passed.length ? 'Show passed businesses again' : undefined}
              onAction={restartDiscover}
            />
          )}
        </ScrollView>
      )}

      {toast ? (
        <View
          accessibilityLiveRegion="polite"
          pointerEvents="none"
          style={[styles.toast, { top: 104, backgroundColor: colors.ink }]}
        >
          <Text style={[type.label, { color: colors.surface }]}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: 'funnel-outline' | 'checkmark-done-outline';
  title: string;
  body: string;
  action?: string;
  onAction: () => void;
}) {
  const colors = useBondColors();
  return (
    <Card style={styles.empty}>
      <Ionicons name={icon} size={32} color={colors.ink} />
      <Text style={[type.subheading, { color: colors.ink }]}>{title}</Text>
      <Text style={[type.body, { color: colors.inkMuted }]}>{body}</Text>
      {action ? <PrimaryButton label={action} onPress={onAction} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filters: { gap: space[2], paddingVertical: space[3], borderBottomWidth: StyleSheet.hairlineWidth },
  count: { paddingHorizontal: space[4] },
  content: { padding: space[4] },
  stage: { flex: 1, paddingTop: space[4], paddingHorizontal: space[4], gap: space[4] },
  empty: { alignItems: 'flex-start', gap: space[3], paddingVertical: space[6] },
  toast: {
    position: 'absolute',
    left: space[4],
    right: space[4],
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
});
