import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, SectionTitle } from '@/components/ui';
import { formatPrice, isCorePlan, type Plan, paidPlans } from '@/data/plans';
import { useCurrentUser, usePlans } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

type IconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Bond's pricing model (docs/bond-app-structure.md, Get More): **Plans** — Free
 * (get matched and start) and Bond Pro (the featured subscription) — then
 * **Premium add-ons**: profile/proposal Boosts, Awesome Molecules expert
 * services, and any plan added in the demo panel. Plans come from
 * src/data/plans.json via usePlans, so demo panel edits show. Nothing is charged.
 */
export function GetMoreSection() {
  const colors = useBondColors();
  const { user } = useCurrentUser();
  const { plans } = usePlans();
  const addedPlans = paidPlans(plans).filter((p) => !isCorePlan(p.id));

  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <SectionTitle>Plans</SectionTitle>
        <OfferCard
          icon="ribbon-outline"
          plan={plans.free}
          // No price line on Free.
          price=""
          badge={user.plan === plans.free.name ? 'Current plan' : undefined}
        />
        <OfferCard
          icon="star-outline"
          plan={plans.plus}
          featured
          actions={[`Get ${plans.plus.name}`]}
        />
      </View>

      <View style={styles.group}>
        <SectionTitle>Premium add-ons</SectionTitle>
        <OfferCard icon="rocket-outline" plan={plans.boost} priceSuffix=" each" actions={['Boost profile', 'Boost a proposal']} />
        <OfferCard
          icon="people-outline"
          plan={{
            name: 'Expert services',
            tagline: 'Optional fractional expert services from Awesome Molecules',
            benefits: ['Hands-on help to plan and run a collaboration'],
          }}
          price="Quoted per project"
          actions={['Talk to an expert']}
        />
        {addedPlans.map((plan) => (
          <OfferCard key={plan.id} icon="star-outline" plan={plan} actions={[`Get ${plan.name}`]} />
        ))}
      </View>

      <Text style={[type.caption, { color: colors.inkMuted }]}>
        Preview only: nothing is charged.
      </Text>
    </View>
  );
}

function OfferCard({
  icon,
  plan,
  price,
  priceSuffix = '',
  badge,
  featured,
  actions = [],
}: {
  icon: IconName;
  plan: Pick<Plan, 'name' | 'tagline' | 'benefits'> & Partial<Plan>;
  /** Overrides the plan's formatted price. */
  price?: string;
  priceSuffix?: string;
  badge?: string;
  /** Bond Pro: an ink card that stands out from the rest, as in the pricing model. */
  featured?: boolean;
  actions?: string[];
}) {
  const colors = useBondColors();
  const fg = featured ? colors.surface : colors.ink;
  const muted = featured ? colors.surface : colors.inkMuted;
  const shownPrice = price ?? (plan.pricePence !== undefined ? formatPrice(plan as Plan) : '');

  return (
    <Card style={featured ? { backgroundColor: colors.ink, borderColor: colors.ink } : undefined}>
      <View style={styles.titleRow}>
        <Ionicons name={icon} size={22} color={fg} />
        <Text style={[type.subheading, styles.flex, { color: fg }]}>{plan.name}</Text>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={[type.caption, { color: colors.onAccent }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {plan.tagline ? <Text style={[type.body, { color: muted, opacity: featured ? 0.85 : 1 }]}>{plan.tagline}</Text> : null}
      {shownPrice ? (
        <Text style={[type.label, { color: fg }]}>
          {shownPrice}
          {priceSuffix}
        </Text>
      ) : null}

      {plan.benefits.length ? (
        <View style={styles.benefits}>
          {plan.benefits.map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <Ionicons name="checkmark" size={18} color={featured ? fg : colors.link} />
              <Text style={[type.body, styles.flex, { color: fg }]}>{benefit}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {actions.length ? (
        <View style={styles.actions}>
          {actions.map((label) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              onPress={() => notInPreview(label)}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: featured ? colors.surface : colors.ink, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[type.label, { color: featured ? colors.ink : colors.surface }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { gap: space[6] },
  group: { gap: space[3] },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  badge: { borderRadius: radius.full, paddingHorizontal: space[2], paddingVertical: 2 },
  benefits: { gap: space[1] },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  actions: { gap: space[2] },
  button: { minHeight: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[4] },
});
