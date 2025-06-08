import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

export default function AuthLayout() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check if the user is authenticated
    if (isAuthenticated) {
      // Redirect to the appropriate section based on user type
      if (isAdmin()) {
        router.replace("/admin");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isAdmin]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}