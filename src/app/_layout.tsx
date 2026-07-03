import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('@/assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-ExtraBold': require('@/assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F0F5' }}>
        <ActivityIndicator size="large" color="#C6F24E" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View className="flex-1 bg-canvas">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="group/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="expense/new" options={{ presentation: 'modal' }} />
            <Stack.Screen name="expense/[id]" options={{ presentation: 'card' }} />
          </Stack>
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
