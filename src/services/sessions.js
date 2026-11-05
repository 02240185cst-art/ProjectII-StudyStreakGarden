// Study sessions with OFFLINE-FIRST sync (new in Project II).
// Every session is saved to a local queue first, then uploaded to Firestore whenever possible.
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { readJson, writeJson, removeKey, withTimeout } from './util';

const col = (uid) => collection(db, 'users', uid, 'sessions');
const cacheKey = (uid) => `ssg:sessions:${uid}`;
const pendingKey = (uid) => `ssg:pending-sessions:${uid}`;

let flushing = false;

export async function flushPending(uid) {
  if (flushing) return 0;
  flushing = true;
  let sent = 0;
  try {
    let pending = await readJson(pendingKey(uid), []);
    const remaining = [];
    for (const s of pending) {
      try {
        await withTimeout(setDoc(doc(col(uid), s.id), s)); // same id => safe to retry, no duplicates
        sent += 1;
      } catch (e) {
        remaining.push(s);
      }
    }
    await writeJson(pendingKey(uid), remaining);
  } finally {
    flushing = false;
  }
  return sent;
}

export async function pendingCount(uid) {
  return (await readJson(pendingKey(uid), [])).length;
}

export async function loadSessions(uid) {
  const pending = await readJson(pendingKey(uid), []);
  let list;
  try {
    const snap = await withTimeout(getDocs(col(uid)));
    list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    list = await readJson(cacheKey(uid), []); // offline
  }
  const ids = new Set(list.map((s) => s.id));
  const merged = [...list, ...pending.filter((p) => !ids.has(p.id))];
  await writeJson(cacheKey(uid), merged);
  return merged;
}

export async function addSession(uid, { subject, durationMinutes }) {
  const session = { id: doc(col(uid)).id, subject, durationMinutes, date: Date.now() };
  const pending = await readJson(pendingKey(uid), []);
  await writeJson(pendingKey(uid), [...pending, session]);
  const cache = await readJson(cacheKey(uid), []);
  await writeJson(cacheKey(uid), [...cache, session]);
  flushPending(uid); // fire and forget — works now if online, otherwise on reconnect
  return session;
}

export async function deleteAll(uid) {
  try {
    const snap = await withTimeout(getDocs(col(uid)));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (e) {
    /* best effort */
  }
  await removeKey(cacheKey(uid));
  await removeKey(pendingKey(uid));
}
