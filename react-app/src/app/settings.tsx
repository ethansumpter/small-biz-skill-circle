import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { StackHeader } from '@/components/stack-header';
import { Card, PrimaryButton } from '@/components/ui';
import { space, type, useBondColors } from '@/theme/tokens';

/**
 * Profile → Settings (gear). In the demo build this page only holds the entry
 * to the demo panel, an admin tool for the demo that isn't part of Bond.
 */
export default function SettingsScreen() {
  const colors = useBondColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <StackHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.titleRow}>
            <Ionicons name="construct-outline" size={24} color={colors.ink} />
            <Text accessibilityRole="header" style={[type.subheading, { color: colors.ink }]}>
              Demo panel
            </Text>
          </View>
          <Text style={[type.body, { color: colors.ink }]}>
            This page is only here to open the demo panel. The demo panel is an admin tool for running the Bond demo.
            It isn't part of the app itself.
          </Text>
          <Text style={[type.body, { color: colors.inkMuted }]}>
            In the demo panel you can view and edit every demo company's information and choose which company you're
            logged in as.
          </Text>
          <PrimaryButton label="Demo panel" onPress={() => router.push('/demo-panel')} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: space[4], width: '100%', maxWidth: 720, alignSelf: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
