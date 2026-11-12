import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton } from '@/components/ui';
import { plans } from '@/data/demo-user';
import { useCurrentUser } from '@/state/preview';
import { space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/** In-app purchases: Boost and Bond Plus. Prices from docs/bond-demo-data.md. */
export function GetMoreSection() {
  const colors = useBondColors();
  const { user: demoUser } = useCurrentUser();

  return (
    <View style={styles.container}>
      <Text style={[type.body, { color: colors.inkMuted }]}>
        You're on the {demoUser.plan} plan: {plans.free.benefits.join(', ').toLowerCase()}.
      </Text>

      <OfferCard
        icon="rocket-outline"
        title="Boost your profile"
        price={plans.boost.price}
        benefits={plans.boost.benefits}
        cta="Boost profile"
      />
      <OfferCard
        icon="star-outline"
        title={plans.plus.name}
        price={plans.plus.price}
        benefits={plans.plus.benefits}
        cta={`Get ${plans.plus.name}`}
      />
    </View>
  );
}

function OfferCard({
  icon,
  title,
  price,
  benefits,
  cta,
}: {
  icon: 'rocket-outline' | 'star-outline';
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
