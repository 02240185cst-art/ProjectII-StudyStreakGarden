import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { readJson, writeJson, removeKey, withTimeout } from './util';

const ref = (uid) => doc(db, 'users', uid);
const cacheKey = (uid) => `ssg:profile:${uid}`;

export const DEFAULT_PROFILE = {
  name: '', studentId: '', email: '', dailyGoalMinutes: 120,
  seedsSpent: 0, ownedDecorations: [], activeBackground: null, photo: null,
};

export async function getProfile(uid) {
  try {
    const snap = await withTimeout(getDoc(ref(uid)));
    if (snap.exists()) {
      const p = { ...DEFAULT_PROFILE, ...snap.data() };
      await writeJson(cacheKey(uid), p);
      return p;
    }
  } catch (e) {
    /* offline -> fall through to cache */
  }
  return readJson(cacheKey(uid), null);
}

async function merge(uid, data) {
  const cached = (await readJson(cacheKey(uid), null)) || { ...DEFAULT_PROFILE };
  await writeJson(cacheKey(uid), { ...cached, ...data });
  await withTimeout(setDoc(ref(uid), data, { merge: true }));
}

export const createProfile = (uid, name, studentId, email) =>
  merge(uid, { ...DEFAULT_PROFILE, name, studentId, email });
export const updateProfile = (uid, name, studentId) => merge(uid, { name, studentId });
export const updateDailyGoal = (uid, dailyGoalMinutes) => merge(uid, { dailyGoalMinutes });
export const savePhoto = (uid, photo) => merge(uid, { photo }); // small base64 JPEG data-URI, or null to remove
export const saveDecorations = (uid, data) => merge(uid, data); // { seedsSpent, ownedDecorations, activeBackground }

export async function deleteProfile(uid) {
  await removeKey(cacheKey(uid));
  await deleteDoc(ref(uid));
}
