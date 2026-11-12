import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BondLogo } from '@/components/bond-logo';
import { CompanyAvatar } from '@/components/company-avatar';
import { IconButton } from '@/components/ui';
import { useCurrentUser } from '@/state/preview';
import { radius, space, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

const AVATAR_SIZE = 144;

/** Top bar (logo, Preferences, Settings) and the firm's logo with edit badge. */
export function ProfileHeader() {
  const colors = useBondColors();
  const { currentUserId } = useCurrentUser();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <BondLogo />
        <View style={styles.actions}>
          <IconButton icon="options-outline" label="Preferences" onPress={() => notInPreview('Preferences')} />
          <IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
        </View>
      </View>

      {/* Firm logo or other image (assets/images/companies/), else a building silhouette. */}
      <View style={styles.avatarWrap}>
        <CompanyAvatar companyId={currentUserId} size={AVATAR_SIZE} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space[6] },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: { flexDirection: 'row' },
  avatarWrap: { alignSelf: 'center' },
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
