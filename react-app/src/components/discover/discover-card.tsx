import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CompanyAvatar } from '@/components/company-avatar';
import { Card, Chip, SectionTitle } from '@/components/ui';
import type { Company } from '@/data/companies';
import { companyProposals, proposalTypesFor } from '@/data/discover';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/**
 * One company on Discover, top to bottom as in docs/bond-app-structure.md §1:
 * offer/looking-for (with ⋮), company details, prompts, mini gallery,
 * proposal block, reviews. Company identity only, never owner names.
 */
export function DiscoverCard({
  company,
  proposalType,
  onProposalType,
  onOpenMenu,
  onComment,
  onSendProposal,
}: {
  company: Company;
  proposalType: string | undefined;
  onProposalType: (type: string | undefined) => void;
  onOpenMenu: () => void;
  /** Comment bubble on the offer box. Omit to hide it (e.g. Your Network). */
  onComment?: () => void;
  /** 👍 in the proposal box. Omit to show only their open proposals. */
  onSendProposal?: () => void;
}) {
  const colors = useBondColors();
  const openProposals = companyProposals(company).filter((p) => p.status === 'Open');

  return (
    <View style={styles.card}>
      {/* 1. Offer / looking for — always first */}
      <Card style={styles.offer}>
        <View style={styles.offerRow}>
          <View style={styles.offerText}>
            <Text style={[type.caption, { color: colors.inkMuted }]}>{company.name}</Text>
            <Labelled label="We can offer" text={company.offer} large />
            <View style={[styles.divider, { backgroundColor: colors.line }]} />
            <Labelled label="We're looking for" text={company.lookingFor} large />
          </View>
          <View style={styles.offerSide}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`More options for ${company.name}`}
              hitSlop={12}
              onPress={onOpenMenu}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.inkMuted} />
            </Pressable>
            {onComment ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Comment on ${company.name}'s offer`}
                onPress={onComment}
                style={({ pressed }) => [
                  styles.bubble,
                  { backgroundColor: colors.surfaceRaised, borderColor: colors.line, transform: [{ scale: pressed ? 0.94 : 1 }] },
                ]}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.ink} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </Card>

      {/* 2. Company details */}
      <Card>
        <View style={styles.identity}>
          <CompanyAvatar companyId={company.id} size={64} />
          <View style={styles.flex}>
            <Text accessibilityRole="header" style={[type.heading, { color: colors.ink }]}>
              {company.name}
            </Text>
            <View style={styles.badges}>
              {company.verified ? (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Ionicons name="shield-checkmark" size={14} color={colors.onAccent} />
                  <Text style={[type.caption, { color: colors.onAccent }]}>Verified</Text>
                </View>
              ) : null}
              <View style={styles.rating} accessibilityLabel={`Rated ${company.rating.toFixed(1)} out of 5`}>
                <Ionicons name="star" size={14} color={colors.ink} />
                <Text style={[type.label, { color: colors.ink }]}>{company.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>
        <Detail icon="location-outline" text={company.location} />
        <Detail icon="people-outline" text={company.size === 'SME' ? 'SME' : 'Micro business'} />
        <Detail icon="briefcase-outline" text={company.industry} />
        <View style={styles.chips}>
          {company.interests.map((interest) => (
            <Chip key={interest} label={interest} />
          ))}
        </View>
      </Card>

      {/* 3. Prompts */}
      {company.prompts.map((prompt) => (
        <Card key={prompt.question}>
          <Labelled label={prompt.question} text={prompt.answer} large />
        </Card>
      ))}

      {/* 4. Mini gallery — entries are image descriptions until real images exist */}
      <View style={styles.section}>
        <SectionTitle>Gallery</SectionTitle>
        <View style={styles.gallery}>
          {company.gallery.map((description) => (
            <View
              key={description}
              accessible
              accessibilityRole="image"
              accessibilityLabel={description}
              style={[styles.tile, { backgroundColor: colors.accent }]}
            >
              <Ionicons name="image-outline" size={22} color={colors.onAccent} />
              <Text numberOfLines={3} style={[type.caption, { color: colors.onAccent }]}>
                {description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Proposal block — pick the kind of proposal, then 👍 to send (mockup) */}
      {onSendProposal || openProposals.length ? (
        <Card>
          {onSendProposal ? (
            <>
              <View style={styles.proposalHead}>
                <View style={styles.flex}>
                  <SectionTitle>Proposal</SectionTitle>
                  <Text style={[type.caption, { color: colors.inkMuted }]}>
                    Pick the kind of proposal, then send it with a comment. With none picked, it goes as a like.
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    proposalType ? `Send a ${proposalType} proposal to ${company.name}` : `Send a like to ${company.name}`
                  }
                  onPress={onSendProposal}
                  style={({ pressed }) => [
                    styles.send,
                    { backgroundColor: colors.ink, transform: [{ scale: pressed ? 0.94 : 1 }] },
                  ]}
                >
                  <Ionicons name="thumbs-up" size={24} color={colors.surface} />
                </Pressable>
              </View>

              <View accessibilityRole="radiogroup" accessibilityLabel="Kind of proposal" style={styles.typeList}>
                {proposalTypesFor(company).map((option, i) => {
                  const selected = option === proposalType;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => onProposalType(selected ? undefined : option)}
                      style={({ pressed }) => [
                        styles.typeRow,
                        selected
                          ? { backgroundColor: colors.accent, borderColor: colors.accent }
                          : { backgroundColor: colors.surfaceRaised, borderColor: colors.line },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <View
                        style={[
                          styles.typeNumber,
                          { backgroundColor: selected ? colors.onAccent : colors.surface },
                        ]}
                      >
                        <Text style={[type.caption, { color: selected ? colors.accent : colors.ink }]}>{i + 1}</Text>
                      </View>
                      <Text style={[type.label, styles.flex, { color: selected ? colors.onAccent : colors.ink }]}>
                        {option}
                      </Text>
                      {selected ? <Ionicons name="checkmark" size={18} color={colors.onAccent} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <SectionTitle>Their proposals</SectionTitle>
          )}

          {openProposals.map((p) => (
            <View key={p.id} style={[styles.proposal, { backgroundColor: colors.surface }]}>
              <Text style={[type.caption, { color: colors.inkMuted }]}>
                Their open proposal · {p.region} · {p.industries}
              </Text>
              <Text style={[type.label, { color: colors.ink }]}>{p.title}</Text>
              <Text style={[type.body, { color: colors.ink }]}>{p.summary}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      {/* 6. Reviews — at the very bottom, platform-controlled */}
      <View style={styles.section}>
        <SectionTitle>Reviews</SectionTitle>
        {company.reviews.length === 0 ? (
          <Text style={[type.body, { color: colors.inkMuted }]}>No reviews yet.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviews}
          >
            {company.reviews.map((review) => (
              <Card key={review.fromId} style={styles.review}>
                <View style={styles.reviewTop}>
                  <Text numberOfLines={1} style={[type.label, styles.flex, { color: colors.ink }]}>
                    {review.from}
                  </Text>
                  <Text
                    accessibilityLabel={`${review.stars} out of 5 stars`}
                    style={[type.caption, { color: colors.inkMuted }]}
                  >
                    {'★'.repeat(review.stars)}
                  </Text>
                </View>
                <Text style={[type.body, styles.flex, { color: colors.ink }]}>{review.text}</Text>
                <Pressable accessibilityRole="button" hitSlop={8} onPress={() => notInPreview('Report review')}>
                  <Text style={[type.caption, { color: colors.link }]}>Report review</Text>
                </Pressable>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function Labelled({ label, text, large }: { label: string; text: string; large?: boolean }) {
  const colors = useBondColors();
  return (
    <View style={styles.labelled}>
      <Text style={[type.caption, { color: colors.inkMuted }]}>{label}</Text>
      <Text style={[large ? type.subheading : type.body, { color: colors.ink }]}>{text}</Text>
    </View>
  );
}

function Detail({ icon, text }: { icon: 'location-outline' | 'people-outline' | 'briefcase-outline'; text: string }) {
  const colors = useBondColors();
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={18} color={colors.inkMuted} />
      <Text style={[type.body, styles.flex, { color: colors.ink }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: space[4] },
  section: { gap: space[3] },
  offer: { paddingVertical: space[6] },
  offerRow: { flexDirection: 'row', gap: space[3] },
  offerText: { flex: 1, gap: space[4] },
  offerSide: { alignItems: 'center', justifyContent: 'space-between' },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: StyleSheet.hairlineWidth },
  labelled: { gap: space[1] },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  badges: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginTop: space[1] },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    borderRadius: radius.full,
    paddingHorizontal: space[2],
    paddingVertical: 2,
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  detail: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  gallery: { flexDirection: 'row', gap: space[2] },
  tile: {
    flex: 1,
    aspectRatio: 0.8,
    borderRadius: radius.md,
    padding: space[2],
    justifyContent: 'space-between',
  },
  proposalHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  send: { width: 52, height: 52, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  typeList: { gap: space[2] },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 48,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  typeNumber: { width: 24, height: 24, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  proposal: { borderRadius: radius.sm, padding: space[3], gap: space[1] },
  reviews: { gap: space[3], paddingRight: space[4] },
  review: { width: 260 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
