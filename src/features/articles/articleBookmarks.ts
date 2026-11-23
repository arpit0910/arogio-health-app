import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { readSavedArticleIds } from "./articleLibraryModel";

// Device-local public reading list, separate from account/session credentials.
const key = "arogio.articles.saved.v1";
export async function loadArticleBookmarks() {
  const raw =
    Platform.OS === "web"
      ? typeof window === "undefined"
        ? null
        : window.localStorage.getItem(key)
      : await SecureStore.getItemAsync(key);
  return readSavedArticleIds(raw);
}
export async function saveArticleBookmarks(ids: string[]) {
  const raw = JSON.stringify(ids);
  if (Platform.OS === "web") window.localStorage.setItem(key, raw);
  else await SecureStore.setItemAsync(key, raw);
}
