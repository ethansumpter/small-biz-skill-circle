import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Chip, SectionTitle } from '@/components/ui';
import { formatLimit } from '@/data/plans';
import { useCurrentUser, useProposals } from '@/state/preview';
import { space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/**
 * Summary of the firm's own profile and activity. The spec leaves "Overview"
 * undefined (docs/bond-features.md, open questions); this follows the
 * "summary of own profile/activity" line in docs/bond-app-structure.md.
 */
export function OverviewSection() {
  const colors = useBondColors();
  const { user: demoUser } = useCurrentUser();
  const { activity } = demoUser;
  const { proposals, maxActiveProposals } = useProposals();

  const stats = [
    { value: `${proposals.length} of ${formatLimit(maxActiveProposals)}`, label: 'Active proposals' },
    { value: String(activity.incomingProposals), label: 'Proposals to you' },
    { value: String(activity.matches), label: 'Matches' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.stats}>
        {stats.map((stat) => (
          <Card key={stat.label} style={styles.stat}>
            <Text style={[type.heading, { color: colors.ink }]}>{stat.value}</Text>
            <Text style={[type.caption, { color: colors.inkMuted }]}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      <Card>
        <Labelled label="We can offer" text={demoUser.offer} />
        <Labelled label="We're looking for" text={demoUser.lookingFor} />
        <View style={styles.chips}>
          {demoUser.interests.map((interest) => (
            <Chip key={interest} label={interest} />
          ))}
        </View>
      </Card>

      <SectionTitle>Prompts</SectionTitle>
      {demoUser.prompts.map((prompt) => (
        <Card key={prompt.question}>
          <Labelled label={prompt.question} text={prompt.answer} />
        </Card>
      ))}

      <View style={styles.reviewsHeading}>
        <SectionTitle>Reviews</SectionTitle>
        <View style={styles.rating}>
          <Ionicons name="star" size={16} color={colors.ink} />
          <Text style={[type.label, { color: colors.ink }]}>{demoUser.rating.toFixed(1)}</Text>
        </View>
      </View>
      {demoUser.reviews.map((review) => (
        <Card key={review.from}>
          <View style={styles.reviewTop}>
            <Text style={[type.label, styles.reviewer, { color: colors.ink }]}>{review.from}</Text>
            <Text accessibilityLabel={`${review.stars} out of 5 stars`} style={[type.caption, { color: colors.inkMuted }]}>
              {'★'.repeat(review.stars)}
            </Text>
          </View>
          <Text style={[type.body, { color: colors.ink }]}>{review.text}</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => notInPreview('Report review')}>
            <Text style={[type.caption, { color: colors.link }]}>Report review</Text>
          </Pressable>
        </Card>
      ))}
    </View>
  );
}

function Labelled({ label, text }: { label: string; text: string }) {
  const colors = useBondColors();
  return (
    <View style={styles.labelled}>
      <Text style={[type.caption, { color: colors.inkMuted }]}>{label}</Text>
      <Text style={[type.body, { color: colors.ink }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space[4] },
  stats: { flexDirection: 'row', gap: space[2] },
  stat: { flex: 1, gap: space[1], padding: space[3] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  labelled: { gap: space[1] },
  reviewsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  reviewer: { flex: 1 },
});
