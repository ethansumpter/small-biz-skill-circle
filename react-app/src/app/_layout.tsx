import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  useFonts,
} from '@expo-google-fonts/lexend';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold });

  if (!fontsLoaded) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
