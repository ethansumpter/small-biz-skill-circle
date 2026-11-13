import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, type ScrollViewInstance, StyleSheet, Text, View } from 'react-native';

import { AI_BUTTON_CLEARANCE } from '@/components/ai-assistant-button';
import { ActionRail } from '@/components/discover/action-rail';
import { CardMenu } from '@/components/discover/card-menu';
import { DiscoverCard } from '@/components/discover/discover-card';
import { FilterBar } from '@/components/discover/filter-bar';
import { LikeSheet } from '@/components/discover/like-sheet';
import { Card, PrimaryButton } from '@/components/ui';
import { DISCOVER_ORDER, type Filters, matchesFilters } from '@/data/discover';
import { useCompanies, useCurrentUser, useDemoProposals, useDiscover, usePlans } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/** Room for the floating action rail and AI bubble below the last review. */
const RAIL_CLEARANCE = AI_BUTTON_CLEARANCE + 52 * 2 + space[3] * 3;

/**
 * Discover: one company at a time (docs/bond-app-structure.md §1, laid out
 * per docs/discover-section-mockup.png). Cross, like and proposal move on to
 * the next company; save doesn't.
 */
export default function DiscoverScreen() {
  const colors = useBondColors();
  const { currentUserId } = useCurrentUser();
  const { getCompany } = useCompanies();
  const { demoProposals } = useDemoProposals();
  const { passed, sent, saved, blocked, passCompany, toggleSaved, sendLike, blockCompany, restartDiscover } =
    useDiscover();

  const [filters, setFilters] = useState<Filters>({});
  const [proposalType, setProposalType] = useState<string | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);

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

  // New company: back to the top, no proposal type picked.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
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

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      {/* Top bar + filter row stay put while the card scrolls */}
      <View style={[styles.filters, { borderBottomColor: colors.line }]}>
        <FilterBar filters={filters} onChange={setFilters} />
        {company ? (
          <Text style={[type.caption, styles.count, { color: colors.inkMuted }]}>
            {feed.length} {feed.length === 1 ? 'business' : 'businesses'} to see
          </Text>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingBottom: company ? RAIL_CLEARANCE : AI_BUTTON_CLEARANCE }]}
      >
        {company ? (
          <DiscoverCard
            company={company}
            proposalType={proposalType}
            onProposalType={setProposalType}
            onOpenMenu={() => setMenuOpen(true)}
            onComment={() => setSheetOpen(true)}
            onSendProposal={() => setSheetOpen(true)}
          />
        ) : remaining.length > 0 ? (
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

      {company ? (
        <>
          <ActionRail
            companyName={company.name}
            saved={saved.includes(company.id)}
            onSave={() => {
              const wasSaved = saved.includes(company.id);
              toggleSaved(company.id);
              setToast(wasSaved ? `Removed ${company.name} from saved.` : `Saved ${company.name} for later.`);
            }}
            onCross={() => passCompany(company.id)}
          />
          <LikeSheet
            company={company}
            visible={sheetOpen}
            proposalType={proposalType}
            onProposalType={setProposalType}
            likesLeft={likesLeft}
            onClose={() => setSheetOpen(false)}
            onSend={send}
          />
          <CardMenu
            visible={menuOpen}
            companyName={company.name}
            onClose={() => setMenuOpen(false)}
            onBlock={() => {
              setMenuOpen(false);
              blockCompany(company.id);
              setToast(`Blocked ${company.name}. They won't appear in Discover.`);
            }}
            onReport={() => {
              setMenuOpen(false);
              notInPreview('Report');
            }}
          />
        </>
      ) : null}

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
