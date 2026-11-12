import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, View } from 'react-native';

import { getCompanyImage } from '@/data/company-images';
import { useCompanies } from '@/state/preview';
import { radius, useBondColors } from '@/theme/tokens';

/**
 * A company's logo in a circle. Falls back to a building silhouette when the
 * company has no image in assets/images/companies/ yet.
 */
export function CompanyAvatar({ companyId, size = 48 }: { companyId: string; size?: number }) {
  const colors = useBondColors();
  const { getCompany } = useCompanies();
  const company = getCompany(companyId);
  const image = getCompanyImage(company);

  const circle = {
    width: size,
    height: size,
    borderRadius: radius.full,
    overflow: 'hidden' as const,
    backgroundColor: colors.accent,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${company.name} logo`}
      style={circle}
    >
      {image ? (
        <Image source={image} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Ionicons name="business" size={Math.round(size * 0.5)} color={colors.onAccent} />
      )}
    </View>
  );
}
