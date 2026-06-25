import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { uint8ArrayToBase64Url, base64UrlDecode } from "@/utils/base64";

const AUTH_URL = process.env.EXPO_PUBLIC_RORK_AUTH_URL!;
const APP_KEY = process.env.EXPO_PUBLIC_RORK_APP_KEY!;
const PROJECT_ID = process.env.EXPO_PUBLIC_PROJECT_ID!;

function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return uint8ArrayToBase64Url(bytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return uint8ArrayToBase64Url(new Uint8Array(hash));
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

function userFromToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(base64UrlDecode(parts[1]));

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email ?? "",
      name: payload.name,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isSigningIn: boolean;
  error: string | null;
  signIn: (provider: "google" | "apple") => Promise<void>;
  phoneSignIn: (phoneNumber: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeVerifierRef = useRef<string | null>(null);

  function clearError() {
    setError(null);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  async function checkAuth() {
    try {
      // 1. Try Rork Auth token (Google / Apple sign-in)
      const accessToken = await SecureStore.getItemAsync("access_token");
      if (accessToken) {
        const decoded = userFromToken(accessToken);
        if (decoded) {
          await syncProfile(decoded);
          setUser(decoded);
          setIsLoading(false);
          return;
        } else {
          // Token expired or invalid — try refreshing
          await refreshToken();
          setIsLoading(false);
          return;
        }
      }

      // No access token — try refresh
      const refreshTokenStored = await SecureStore.getItemAsync("refresh_token");
      if (refreshTokenStored) {
        await refreshToken();
        setIsLoading(false);
        return;
      }

      // 2. Try phone session (phone-number OTP sign-in)
      const phoneSession = await SecureStore.getItemAsync("phone_session");
      if (phoneSession) {
        // Restore phone user from Zustand persist (already hydrated from AsyncStorage)
        const storedUser = useAuthStore.getState().user;
        if (storedUser) {
          setUser({
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.name,
            picture: storedUser.profileImage,
          });
        }
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeepLink(event: { url: string }) {
    try {
      const url = new URL(event.url);
      if (url.pathname === "/auth/callback") {
        const code = url.searchParams.get("code");
        if (code) {
          await exchangeCode(code);
        }
      }
    } catch (err) {
      console.error("Deep link handling failed:", err);
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  }

  /** Sync the auth user into the Zustand store (which handles Supabase upsert + fetch) */
  async function syncProfile(authUser: AuthUser) {
    try {
      await useAuthStore.getState().syncProfile(
        authUser.id,
        authUser.email,
        authUser.name,
        authUser.picture
      );
    } catch (err) {
      console.error("Profile sync failed:", err);
    }
  }

  async function signIn(provider: "google" | "apple") {
    setIsSigningIn(true);
    setError(null);
    try {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      codeVerifierRef.current = verifier;

      const isWeb = Platform.OS === "web";
      const target = "rn";
      const env = isWeb ? "preview" : "native";

      const response = await fetch(`${AUTH_URL}/oauth/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_key: APP_KEY, provider, code_challenge: challenge, target, env, app_path: "expo" }),
      });

      if (!response.ok) {
        codeVerifierRef.current = null;
        const body = await response.json().catch(() => ({}));
        const message = body.error || `Sign in failed (${response.status})`;
        console.error(`Auth initiate failed (${response.status}):`, body);
        setError(message);
        return;
      }

      const { auth_url } = await response.json();

      if (isWeb) {
        const popup = window.open(auth_url, "_blank", "width=500,height=650");

        await new Promise<void>((resolve, reject) => {
          const onMessage = (event: MessageEvent) => {
            if (event.data?.type !== "rork_auth_callback") return;
            window.removeEventListener("message", onMessage);
            clearInterval(pollTimer);
            const code = event.data.code;
            if (code) {
              exchangeCode(code).then(resolve, reject);
            } else {
              reject(new Error("No code received"));
            }
          };
          window.addEventListener("message", onMessage);

          const pollTimer = setInterval(() => {
            if (popup?.closed) {
              clearInterval(pollTimer);
              window.removeEventListener("message", onMessage);
              codeVerifierRef.current = null;
              resolve();
            }
          }, 500);
        });
      } else {
        const result = await WebBrowser.openAuthSessionAsync(auth_url, `rork-${PROJECT_ID}://auth/callback`);

        if (result.type === "success") {
          const url = new URL(result.url);
          const code = url.searchParams.get("code");
          if (code) {
            await exchangeCode(code);
          }
        }
      }
    } catch (err) {
      console.error("Sign in failed:", err);
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setIsSigningIn(false);
    }
  }

  async function exchangeCode(code: string) {
    const verifier = codeVerifierRef.current;
    if (!verifier) return;
    codeVerifierRef.current = null;

    const response = await fetch(`${AUTH_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_key: APP_KEY, code, code_verifier: verifier }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body.error || `Token exchange failed (${response.status})`;
      console.error(`Token exchange failed (${response.status}):`, body);
      setError(message);
      return;
    }

    const { access_token, refresh_token, user: userData } = await response.json();

    await SecureStore.setItemAsync("access_token", access_token);
    await SecureStore.setItemAsync("refresh_token", refresh_token);

    // Sync store BEFORE setting local user — so redirect logic sees populated store
    await syncProfile(userData);
    setUser(userData);
  }

  async function refreshToken() {
    const storedRefreshToken = await SecureStore.getItemAsync("refresh_token");
    if (!storedRefreshToken) {
      setUser(null);
      return;
    }

    const response = await fetch(`${AUTH_URL}/oauth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_key: APP_KEY, refresh_token: storedRefreshToken }),
    });

    if (!response.ok) {
      await signOut();
      return;
    }

    const { access_token } = await response.json();
    await SecureStore.setItemAsync("access_token", access_token);

    const decoded = userFromToken(access_token);
    if (decoded) {
      // Sync store BEFORE setting local user
      await syncProfile(decoded);
      setUser(decoded);
    }
  }

  async function phoneSignIn(phoneNumber: string) {
    setIsSigningIn(true);
    setError(null);
    try {
      const userId = `phone_${phoneNumber.replace(/\D/g, "")}`;
      const email = `${phoneNumber.replace(/\D/g, "")}@phone.2spoons.app`;
      const name = `User ${phoneNumber.slice(-4)}`;

      const authUser: AuthUser = { id: userId, email, name };

      // Store a phone session marker (not a fake JWT — those get rejected by Supabase)
      // This lets checkAuth() restore the session on next app launch.
      await SecureStore.setItemAsync("phone_session", userId);

      // Populate the Zustand store with basic phone-user state so redirect logic works
      // even if the Supabase profile sync fails (RLS requires a real JWT for inserts).
      useAuthStore.setState({
        user: {
          id: userId,
          email,
          name,
          phone: phoneNumber,
          address: "",
          profileImage: "",
          experience: "",
          cuisineTypes: [],
          paymentMethods: [],
          location: { latitude: 0, longitude: 0 },
          isChef: false,
          allowProfileDisplay: true,
          isVerified: false,
          isAdmin: false,
          rating: 0,
          reviewCount: 0,
          officeAddress: "",
          officeLocation: { latitude: 0, longitude: 0 },
          homeToOfficeRoute: [],
          officeToHomeRoute: [],
          routesSameAsHomeToOffice: true,
          detourPreference: 500,
          firstPostDate: null,
          postCount: 0,
          freePostsRemaining: 3,
        },
        isAuthenticated: true,
        isAdmin: false,
        userPreference: null,
      });

      // Try to sync the profile to Supabase (may fail without a real JWT;
      // the user is still logged in locally regardless).
      try {
        await syncProfile(authUser);
      } catch {
        console.log("Phone user profile sync skipped (no Rork Auth JWT)");
      }

      setUser(authUser);
    } catch (err) {
      console.error("Phone sign in failed:", err);
      setError(err instanceof Error ? err.message : "Phone sign in failed");
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("phone_session");
    useAuthStore.getState().logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isSigningIn, error, signIn, phoneSignIn, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
