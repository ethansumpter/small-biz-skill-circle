import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton } from '@/components/ui';
import { formatPrice, type Plan, paidPlans } from '@/data/plans';
import { useCurrentUser, usePlans } from '@/state/preview';
import { space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/**
 * In-app purchases: every plan but Free (Boost, Bond Plus, then any added in the
 * demo panel). From src/data/plans.json via usePlans, so demo panel edits show.
 */
export function GetMoreSection() {
  const colors = useBondColors();
  const { user: demoUser } = useCurrentUser();
  const { plans } = usePlans();

  return (
    <View style={styles.container}>
      <Text style={[type.body, { color: colors.inkMuted }]}>
        You're on the {demoUser.plan} plan: {plans.free.benefits.join(', ').toLowerCase()}.
      </Text>

      {paidPlans(plans).map((plan) =>
        plan.id === 'boost' ? (
          <OfferCard
            key={plan.id}
            icon="rocket-outline"
            title="Boost your profile"
            price={formatPrice(plan)}
            benefits={plan.benefits}
            cta="Boost profile"
          />
        ) : (
          <OfferCard
            key={plan.id}
            icon={ICONS[plan.type] ?? 'star-outline'}
            title={plan.name}
            price={formatPrice(plan)}
            benefits={plan.benefits}
            cta={`Get ${plan.name}`}
          />
        ),
      )}
    </View>
  );
}

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<Plan['type'], IconName> = {
  plan: 'ribbon-outline',
  'one-off': 'flash-outline',
  subscription: 'star-outline',
};

function OfferCard({
  icon,
  title,
  price,
  benefits,
  cta,
}: {
  icon: IconName;
  title: string;
  price: string;
  benefits: string[];
  cta: string;
}) {
  const colors = useBondColors();

  return (
    <Card>
      <View style={styles.titleRow}>
        <Ionicons name={icon} size={22} color={colors.ink} />
        <Text style={[type.subheading, styles.title, { color: colors.ink }]}>{title}</Text>
        <Text style={[type.label, { color: colors.ink }]}>{price}</Text>
      </View>
      <View style={styles.benefits}>
        {benefits.map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <Ionicons name="checkmark" size={18} color={colors.link} />
            <Text style={[type.body, styles.benefitText, { color: colors.ink }]}>{benefit}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton label={cta} onPress={() => notInPreview(cta)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: space[4] },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  title: { flex: 1 },
  benefits: { gap: space[1] },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
  benefitText: { flex: 1 },
});
