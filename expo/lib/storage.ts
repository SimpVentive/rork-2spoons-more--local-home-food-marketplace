import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

const isServer = typeof window === "undefined";

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const zustandStorage = createJSONStorage(() => {
  if (isServer) {
    return noopStorage;
  }

  return Platform.OS === "web"
    ? localStorage
    : AsyncStorage;
});

export const authStorage =
  !isServer && Platform.OS !== "web"
    ? AsyncStorage
    : undefined;