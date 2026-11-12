import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  useFonts,
} from '@expo-google-fonts/lexend';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PreviewProvider } from '@/state/preview';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold });

  // Wait for Lexend, but if it fails to load (e.g. a flaky mobile connection), show the app in
  // the system font rather than a blank screen.
  if (!fontsLoaded && !fontError) return null;

  return (
    <PreviewProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="leads/[id]" />
        <Stack.Screen name="network/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="demo-panel" />
      </Stack>
      <StatusBar style="auto" />
    </PreviewProvider>
  );
}
