import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  useFonts,
} from '@expo-google-fonts/lexend';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { PreviewProvider } from '@/state/preview';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold });

  // Wait for Lexend, but if it fails to load (e.g. a flaky mobile connection), show the app in
  // the system font rather than a blank screen.
  if (!fontsLoaded && !fontError) return null;

  return (
    <PreviewProvider>
      {/* One fixed header above every page; it stays put while screens change underneath. */}
      <View style={styles.root}>
        <AppHeader />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="leads/[id]" />
          <Stack.Screen name="network/[id]" />
          <Stack.Screen name="proposals/new" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="demo-panel" />
        </Stack>
      </View>
      <StatusBar style="auto" />
    </PreviewProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
