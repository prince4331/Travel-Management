import localforage from "localforage";

const STORE_NAME = "travel-management-app";

localforage.config({
  name: "TravelManagement",
  storeName: STORE_NAME,
  description: "Offline cache for travel management data",
});

export async function getItem<T>(key: string, fallback: T): Promise<T> {
  const value = await localforage.getItem<T>(key);
  if (value === null || value === undefined) {
    return fallback;
  }
  return value;
}

export async function setItem<T>(key: string, value: T) {
  await localforage.setItem(key, value);
}

export async function mergeItem<T extends Record<string, unknown>>(key: string, value: T) {
  const current = await getItem<T | null>(key, null);
  const merged = { ...(current ?? {}), ...value } as T;
  await setItem(key, merged);
  return merged;
}

export async function removeItem(key: string) {
  await localforage.removeItem(key);
}

export async function clearOfflineStore() {
  await localforage.clear();
}

export async function listKeys() {
  return localforage.keys();
}
