import AsyncStorage from '@react-native-async-storage/async-storage';

export const withTimeout = (promise, ms = 8000) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

export async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
export const writeJson = (key, value) => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
export const removeKey = (key) => AsyncStorage.removeItem(key).catch(() => {});
