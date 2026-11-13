import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CompanyAvatar } from '@/components/company-avatar';
import { useCompanies, useCurrentUser } from '@/state/preview';
import { radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

const AVATAR_SIZE = 144;
const AVATAR_BORDER = 4;

/** The firm's bordered logo with edit badge, and its name. (The top bar is the shared AppHeader.) */
export function ProfileHeader() {
  const colors = useBondColors();
  const { currentUserId } = useCurrentUser();
  const { getCompany } = useCompanies();

  return (
    <View style={styles.container}>
      {/* Firm logo or other image (assets/images/companies/), else a building silhouette. */}
      <View style={styles.avatarWrap}>
        <CompanyAvatar
          companyId={currentUserId}
          size={AVATAR_SIZE}
          borderWidth={AVATAR_BORDER}
          borderColor={colors.ink}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          hitSlop={8}
          onPress={() => notInPreview('Edit profile')}
          style={[styles.editBadge, { backgroundColor: colors.ink, borderColor: colors.surface }]}
        >
          <Ionicons name="pencil" size={18} color={colors.surface} />
        </Pressable>
      </View>

      <Text accessibilityRole="header" style={[type.heading, styles.name, { color: colors.ink }]}>
        {getCompany(currentUserId).name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space[6] },
  avatarWrap: { alignSelf: 'center' },
  name: { textAlign: 'center', marginTop: -space[3] },
  editBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
