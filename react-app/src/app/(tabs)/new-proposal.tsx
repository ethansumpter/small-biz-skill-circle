import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

import { useBottomClearance } from '@/components/ai-assistant-button';
import { useTabBarScrollHandler } from '@/components/tab-bar-visibility';
import { ProposalCard } from '@/components/proposals/proposal-card';
import { Card } from '@/components/ui';
import { formatLimit } from '@/data/plans';
import { useProposals } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * ＋ New Proposal tab (docs/new-proposal-section-mockup.png): your active
 * proposals, then one "＋ New proposal" button that opens the form on its own
 * page (/proposals/new). A short note confirms a new post when you come back.
 */
export default function NewProposalScreen() {
  const colors = useBondColors();
  const bottomClearance = useBottomClearance();
  // Hides the tab bar while scrolling down, shows it scrolling up.
  const onScroll = useTabBarScrollHandler();
  const { proposals, canAdd, maxActiveProposals } = useProposals();

  // /proposals/new returns here with a fresh `posted` stamp after each post.
  const { posted } = useLocalSearchParams<{ posted?: string }>();
  const [seenPosted, setSeenPosted] = useState(posted);
  const [justPosted, setJustPosted] = useState(false);
  if (posted !== seenPosted) {
    setSeenPosted(posted);
    setJustPosted(!!posted);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingBottom: bottomClearance }]}
      >
        <View style={styles.titleRow}>
          <Text accessibilityRole="header" style={[type.heading, styles.flex, { color: colors.ink }]}>
            Your proposals
          </Text>
          <View style={[styles.count, { borderColor: colors.line }]}>
            <Text style={[type.caption, { color: colors.inkMuted }]}>
              {proposals.length} of {formatLimit(maxActiveProposals)} active
            </Text>
          </View>
        </View>

        {justPosted ? (
          <Animated.View
            entering={FadeIn.duration(200).easing(EASE_OUT)}
            exiting={FadeOut.duration(150)}
            accessibilityRole="alert"
            style={[styles.notice, { backgroundColor: colors.surfaceRaised, borderColor: colors.line }]}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.ink} />
            <Text style={[type.caption, styles.flex, { color: colors.ink }]}>
              Proposal added. Preview only: it isn&apos;t shared and resets on reload.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              hitSlop={10}
              onPress={() => setJustPosted(false)}
            >
              <Ionicons name="close" size={18} color={colors.inkMuted} />
            </Pressable>
          </Animated.View>
        ) : null}

        {proposals.length ? (
          <View style={styles.list}>
            {proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </View>
        ) : (
          <Card>
            <Text style={[type.subheading, { color: colors.ink }]}>No proposals yet</Text>
            <Text style={[type.body, { color: colors.inkMuted }]}>
              Say what you need and what you can give back. Other businesses see it first on your Discover card.
            </Text>
          </Card>
        )}

        <View style={styles.action}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canAdd }}
            disabled={!canAdd}
            onPress={() => router.push('/proposals/new')}
            style={({ pressed }) => [
              styles.newButton,
              { backgroundColor: colors.ink, opacity: !canAdd ? 0.4 : pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons name="add" size={22} color={colors.surface} />
            <Text style={[type.label, { color: colors.surface }]}>New proposal</Text>
          </Pressable>
          {!canAdd ? (
            <Text style={[type.caption, styles.center, { color: colors.inkMuted }]}>
              You&apos;re at the limit of {maxActiveProposals}. Close one to post another.
            </Text>
          ) : null}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  content: {
    paddingHorizontal: space[4],
    paddingTop: space[4],
    gap: space[4],
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  count: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: space[2],
    paddingVertical: 2,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    padding: space[3],
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  list: { gap: space[3] },
  action: { gap: space[2], marginTop: space[2] },
  newButton: {
    flexDirection: 'row',
    gap: space[2],
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
