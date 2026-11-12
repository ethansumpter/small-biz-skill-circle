import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GetMoreSection } from '@/components/profile/get-more-section';
import { OverviewSection } from '@/components/profile/overview-section';
import { ProfileHeader } from '@/components/profile/profile-header';
import { type ProfileTab, ProfileTabs } from '@/components/profile/profile-tabs';
import { SafetySection } from '@/components/profile/safety-section';
import { space, useBondColors } from '@/theme/tokens';

export default function ProfileScreen() {
  const colors = useBondColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<ProfileTab>('Get More');

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[2] }]}
    >
      <ProfileHeader />
      <ProfileTabs value={tab} onChange={setTab} />
      {tab === 'Get More' && <GetMoreSection />}
      {tab === 'Safety' && <SafetySection />}
      {tab === 'Overview' && <OverviewSection />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space[4],
    paddingBottom: space[12],
    gap: space[6],
  },
});
