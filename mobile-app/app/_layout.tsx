import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="explore/search" options={{ headerShown: false }} />
        <Stack.Screen name="explore/category" options={{ headerShown: false }} />
        <Stack.Screen name="explore/popular" options={{ headerShown: false }} />
        <Stack.Screen name="services/detail" options={{ headerShown: false }} />
        <Stack.Screen name="services/native-purifier" options={{ headerShown: false }} />
        <Stack.Screen name="services/native-smart-locks" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
