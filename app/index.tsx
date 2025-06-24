// app/index.tsx
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user === null) return; // wait for auth to initialize

    if (user) {
      router.replace(isAdmin ? "/(admin)" : "/(tabs)");
    } else {
      router.replace("/(auth)");
    }
  }, [user]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
