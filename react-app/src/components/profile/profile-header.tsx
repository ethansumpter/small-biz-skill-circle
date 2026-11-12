import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/ui';
import { demoUser } from '@/data/demo-user';
import { brand, radius, space, type, useBondColors } from '@/theme/tokens';
import { notInPreview } from '@/utils/preview';

/** Top bar (logo, Preferences, Settings) and the firm's avatar with edit badge. */
export function ProfileHeader() {
  const colors = useBondColors();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {/* Wordmark stand-in until the bond-logo.png asset is added to the app. */}
        <View style={[styles.logoTile, { backgroundColor: brand.platinum }]}>
          <Text accessibilityRole="header" style={[type.heading, { color: brand.navy }]}>
            Bond
          </Text>
        </View>
        <View style={styles.actions}>
          <IconButton icon="options-outline" label="Preferences" onPress={() => notInPreview('Preferences')} />
          <IconButton icon="settings-outline" label="Settings" onPress={() => notInPreview('Settings')} />
        </View>
      </View>

      <View style={styles.identity}>
        <View>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={[type.heading, { color: colors.onAccent }]}>{demoUser.initials}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            hitSlop={8}
            onPress={() => notInPreview('Edit profile')}
            style={[styles.editBadge, { backgroundColor: colors.ink, borderColor: colors.surface }]}
          >
            <Ionicons name="pencil" size={16} color={colors.surface} />
          </Pressable>
        </View>

        <View style={styles.nameRow}>
          <Text style={[type.heading, { color: colors.ink }]}>{demoUser.name}</Text>
          {demoUser.verified ? (
            <Ionicons name="checkmark-circle" size={20} color={colors.link} accessibilityLabel="Verified business" />
          ) : null}
        </View>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          {demoUser.industry} · {demoUser.location} · {demoUser.size}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space[4] },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoTile: {
    borderRadius: radius.sm,
    paddingHorizontal: space[2],
  },
  actions: { flexDirection: 'row' },
  identity: { alignItems: 'center', gap: space[2] },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    marginTop: space[2],
  },
});
