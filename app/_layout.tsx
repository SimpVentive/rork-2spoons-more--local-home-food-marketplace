import colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Slot, useRootNavigationState, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();
  const navigationState = useRootNavigationState(); // ✅ Check if navigation is ready

  useEffect(() => {
    if (!navigationState?.key || !user) return;

    router.replace(isAdmin ? "/(admin)" : "/(tabs)");
  }, [navigationState?.key, user, isAdmin]);

  return (
    <View
          style={[
            styles.container,
            { paddingBottom: insets.bottom || 16 },
          ]}
        >
        <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
