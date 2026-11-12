import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
}: {
  company: Company;
  proposalType: string | undefined;
  onProposalType: (type: string | undefined) => void;
  onOpenMenu: () => void;
}) {
  const colors = useBondColors();
  const openProposals = companyProposals(company).filter((p) => p.status === 'Open');

  return (
    <View style={styles.card}>
      {/* 1. Offer / looking for — always first */}
      <Card style={styles.offer}>
        <View style={styles.offerHead}>
          <Text style={[type.caption, styles.flex, { color: colors.inkMuted }]}>{company.name}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`More options for ${company.name}`}
            hitSlop={12}
            onPress={onOpenMenu}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={colors.inkMuted} />
          </Pressable>
        </View>
        <Labelled label="We can offer" text={company.offer} large />
        <View style={[styles.divider, { backgroundColor: colors.line }]} />
        <Labelled label="We're looking for" text={company.lookingFor} large />
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

      {/* 5. Proposal block */}
      <Card>
        <SectionTitle>Propose something</SectionTitle>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          Pick a type to send a proposal, or leave it to send a like.
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Proposal type" style={styles.chips}>
          {proposalTypesFor(company).map((option) => {
            const selected = option === proposalType;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => onProposalType(selected ? undefined : option)}
                style={[
                  styles.choice,
                  selected
                    ? { backgroundColor: colors.accent, borderColor: colors.accent }
                    : { backgroundColor: colors.surfaceRaised, borderColor: colors.line },
                ]}
              >
                <Text style={[type.label, { color: selected ? colors.onAccent : colors.ink }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
        {openProposals.map((p) => (
          <View key={p.id} style={[styles.proposal, { backgroundColor: colors.surface }]}>
            <Text style={[type.caption, { color: colors.inkMuted }]}>
              Open proposal · {p.region} · {p.industries}
            </Text>
            <Text style={[type.label, { color: colors.ink }]}>{p.title}</Text>
            <Text style={[type.body, { color: colors.ink }]}>{p.summary}</Text>
          </View>
        ))}
      </Card>

      {/* 6. Reviews — at the very bottom, platform-controlled */}
      <View style={styles.section}>
        <SectionTitle>Reviews</SectionTitle>
        {company.reviews.length === 0 ? (
          <Text style={[type.body, { color: colors.inkMuted }]}>No reviews yet.</Text>
        ) : (
          company.reviews.map((review) => (
            <Card key={review.fromId}>
              <View style={styles.reviewTop}>
                <Text style={[type.label, styles.flex, { color: colors.ink }]}>{review.from}</Text>
                <Text
                  accessibilityLabel={`${review.stars} out of 5 stars`}
                  style={[type.caption, { color: colors.inkMuted }]}
                >
                  {'★'.repeat(review.stars)}
                </Text>
              </View>
              <Text style={[type.body, { color: colors.ink }]}>{review.text}</Text>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => notInPreview('Report review')}>
                <Text style={[type.caption, { color: colors.link }]}>Report review</Text>
              </Pressable>
            </Card>
          ))
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
  offer: { gap: space[4], paddingVertical: space[6] },
  offerHead: { flexDirection: 'row', alignItems: 'center' },
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
  choice: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: space[3],
    minHeight: 40,
    justifyContent: 'center',
  },
  proposal: { borderRadius: radius.sm, padding: space[3], gap: space[1] },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
