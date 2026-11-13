import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useBottomClearance } from '@/components/ai-assistant-button';
import { GetMoreSection } from '@/components/profile/get-more-section';
import { OverviewSection } from '@/components/profile/overview-section';
import { ProfileHeader } from '@/components/profile/profile-header';
import { type ProfileTab, ProfileTabs } from '@/components/profile/profile-tabs';
import { SafetySection } from '@/components/profile/safety-section';
import { space, useBondColors } from '@/theme/tokens';

export default function ProfileScreen() {
  const colors = useBondColors();
  const bottomClearance = useBottomClearance();
  const [tab, setTab] = useState<ProfileTab>('Get more');

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingBottom: bottomClearance }]}>
        <ProfileHeader />
        <ProfileTabs value={tab} onChange={setTab} />
        {tab === 'Get more' && <GetMoreSection />}
        {tab === 'Safety' && <SafetySection />}
        {tab === 'Overview' && <OverviewSection />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: space[4],
    paddingTop: space[4],
    gap: space[6],
  },
});
