import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from "@/store/auth-store";
import { uint8ArrayToBase64Url, base64UrlDecode } from "@/utils/base64";

const AUTH_URL = process.env.EXPO_PUBLIC_RORK_AUTH_URL?.trim();
const APP_KEY = process.env.EXPO_PUBLIC_RORK_APP_KEY?.trim();
const PROJECT_ID = process.env.EXPO_PUBLIC_PROJECT_ID?.trim();

function getAuthConfigError(): string | null {
  if (!AUTH_URL || !APP_KEY || !PROJECT_ID) {
    return "Rork authentication is not configured. Add EXPO_PUBLIC_RORK_AUTH_URL, EXPO_PUBLIC_RORK_APP_KEY, and EXPO_PUBLIC_PROJECT_ID to expo/.env.";
  }

  if (
    AUTH_URL.includes("your-") ||
    AUTH_URL.includes("supabase.co") ||
    APP_KEY.includes("your-") ||
    APP_KEY.includes("dummy") ||
    PROJECT_ID.includes("your-")
  ) {
    return "Rork authentication is using placeholder values. Replace the Rork environment variables in expo/.env with your real project credentials.";
  }

  return null;
}

async function generateCodeVerifier(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return uint8ArrayToBase64Url(bytes);
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashHex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return uint8ArrayToBase64Url(hexToUint8Array(hashHex));
}

function generateUuid(): string {
  if (typeof Crypto.randomUUID === "function") {
    return Crypto.randomUUID();
  }
  // Fallback for older expo-crypto versions without randomUUID
  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  phone?: string;
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
  phoneSignIn: (
    phoneNumber: string,
    authUser?: AuthUser,
    options?: { allowLocalFallback?: boolean }
  ) => Promise<void>;
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
      const accessToken = await getStorageItem("access_token");
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
      const refreshTokenStored = await getStorageItem("refresh_token");
      if (refreshTokenStored) {
        await refreshToken();
        setIsLoading(false);
        return;
      }

      // 2. Try phone session (phone-number OTP sign-in)
      const phoneSession = await getStorageItem("phone_session");
      if (phoneSession) {
        // Restore phone user from Zustand persist (already hydrated from AsyncStorage)
        const storedUser = useAuthStore.getState().user;
        if (storedUser) {
          setUser({
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.name,
            picture: storedUser.profileImage,
            phone: storedUser.phone,
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
      const configError = getAuthConfigError();
      if (configError) {
        setError(configError);
        return;
      }

      const verifier = await generateCodeVerifier();
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

        if (!popup) {
          // Popup blocked by the browser — surface this instead of hanging forever.
          codeVerifierRef.current = null;
          setError("Sign-in popup was blocked. Please allow popups for this site and try again.");
          return;
        }

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
            if (popup.closed) {
              clearInterval(pollTimer);
              window.removeEventListener("message", onMessage);
              codeVerifierRef.current = null;
              resolve();
            }
          }, 500);
        });
      } else {
        const callbackUrl = `rork-${PROJECT_ID}://auth/callback`;
        const result = await WebBrowser.openAuthSessionAsync(auth_url, callbackUrl);

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

    const configError = getAuthConfigError();
    if (configError) {
      setError(configError);
      return;
    }

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

    await setStorageItem("access_token", access_token);
    await setStorageItem("refresh_token", refresh_token);

    // Sync store BEFORE setting local user — so redirect logic sees populated store
    await syncProfile(userData);
    setUser(userData);
  }

  async function refreshToken() {
    const storedRefreshToken = await getStorageItem("refresh_token");
    if (!storedRefreshToken) {
      setUser(null);
      return;
    }

    const configError = getAuthConfigError();
    if (configError) {
      setError(configError);
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
    await setStorageItem("access_token", access_token);

    const decoded = userFromToken(access_token);
    if (decoded) {
      // Sync store BEFORE setting local user
      await syncProfile(decoded);
      setUser(decoded);
    }
  }

  async function phoneSignIn(
    phoneNumber: string,
    authUser?: AuthUser,
    options?: { allowLocalFallback?: boolean }
  ) {
    setIsSigningIn(true);
    setError(null);

    try {
      const allowLocalFallback = options?.allowLocalFallback === true;

      const phoneDigits = phoneNumber.replace(/\D/g, "");

      const formattedPhone =
        phoneNumber.startsWith("+")
          ? phoneNumber
          : `+91${phoneDigits}`;

      let resolvedAuthUser = authUser;

      if (isSupabaseConfigured && !allowLocalFallback) {
        // --------------------------------------------------
        // Find existing profile by phone
        // --------------------------------------------------
        const { data: existingUser, error: findError } = await supabase
          .from("profiles")
          .select("*")
          .eq("phone", phoneDigits)
          .maybeSingle();

        if (findError) {
          throw findError;
        }

        if (existingUser) {
          resolvedAuthUser = {
            id: existingUser.id,
            email:
              existingUser.email ||
              `${phoneDigits}@phone.2spoons.app`,
            name:
              existingUser.name ||
              `User ${phoneDigits.slice(-4)}`,
            picture: existingUser.avatar_url ?? undefined,
            phone: existingUser.phone,
          };
        } else {
          // ----------------------------------------------
          // Create new profile
          // ----------------------------------------------

          const userId = generateUuid();

          const newProfile = {
            id: userId,
            phone: phoneDigits,
            email: `${phoneDigits}@phone.2spoons.app`,
            name: `User ${phoneDigits.slice(-4)}`,
            avatar_url: null,

            address: "",

            experience: "",

            cuisine_types: [],

            payment_methods: [],

            location_lat: 0,
            location_lng: 0,

            office_address: "",

            office_lat: 0,
            office_lng: 0,

            home_to_office_route: [],

            office_to_home_route: [],

            routes_same_as_home_to_office: true,

            detour_preference: 500,

            is_chef: false,
            allow_profile_display: true,
            is_verified: true,
            is_admin: false,

            rating: 0,
            review_count: 0,

            first_post_date: null,
            post_count: 0,
            free_posts_remaining: 3,
          };

          const { data: insertedUser, error: insertError } =
            await supabase
              .from("profiles")
              .insert(newProfile)
              .select()
              .single();

          if (insertError) {
            throw insertError;
          }

          resolvedAuthUser = {
            id: insertedUser.id,
            email: insertedUser.email,
            name: insertedUser.name,
            picture: insertedUser.avatar_url ?? undefined,
            phone: insertedUser.phone,
          };
        }
      }

      // ---------------------------------------
      // Build authenticated user
      // ---------------------------------------

      const userId =
        resolvedAuthUser?.id ??
        `phone_${phoneDigits}`;

      const email =
        resolvedAuthUser?.email ??
        `${phoneDigits}@phone.2spoons.app`;

      const name =
        resolvedAuthUser?.name ??
        `User ${phoneDigits.slice(-4)}`;

      const picture = resolvedAuthUser?.picture;

      const resolvedPhone =
        resolvedAuthUser?.phone ?? formattedPhone;

      const canonicalPhone =
        resolvedPhone.replace(/\D/g, "").slice(-10);

      await setStorageItem("phone_session", userId);

      if (isSupabaseConfigured && !allowLocalFallback) {
        const syncedUser =
          await useAuthStore.getState().syncProfile(
            userId,
            email,
            name,
            picture,
            canonicalPhone
          );

        if (!syncedUser) {
          throw new Error("Failed to synchronize profile.");
        }

        setUser({
          id: userId,
          email: email,
          name: name,
          picture: picture,
          phone: canonicalPhone,
        });

        return;
      }

      // Local fallback

      useAuthStore.setState({
        user: {
          id: userId,
          email,
          name,
          phone: canonicalPhone,
          address: "",
          profileImage: picture ?? "",
          experience: "",
          cuisineTypes: [],
          paymentMethods: [],
          location: {
            latitude: 0,
            longitude: 0,
          },
          isChef: false,
          allowProfileDisplay: true,
          isVerified: false,
          isAdmin: false,
          rating: 0,
          reviewCount: 0,
          officeAddress: "",
          officeLocation: {
            latitude: 0,
            longitude: 0,
          },
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

      setUser({
        id: userId,
        email,
        name,
        picture,
        phone: canonicalPhone,
      });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Phone sign in failed"
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    await removeStorageItem("access_token");
    await removeStorageItem("refresh_token");
    await removeStorageItem("phone_session");
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


export async function getStorageItem(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function setStorageItem(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

export async function removeStorageItem(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  return SecureStore.deleteItemAsync(key);
}
