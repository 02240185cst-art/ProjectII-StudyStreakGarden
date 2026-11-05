// Subjects: local-first with a small queue of pending writes so edits made offline are not lost.
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { readJson, writeJson, removeKey, withTimeout } from './util';

const col = (uid) => collection(db, 'users', uid, 'subjects');
const cacheKey = (uid) => `ssg:subjects:${uid}`;
const opsKey = (uid) => `ssg:subject-ops:${uid}`;
let flushing = false;

export async function flushOps(uid) {
  if (flushing) return;
  flushing = true;
  try {
    const ops = await readJson(opsKey(uid), []);
    const remaining = [];
    for (const op of ops) {
      try {
        if (op.type === 'set') await withTimeout(setDoc(doc(col(uid), op.id), { name: op.name }));
        else await withTimeout(deleteDoc(doc(col(uid), op.id)));
      } catch (e) {
        remaining.push(op);
      }
    }
    await writeJson(opsKey(uid), remaining);
  } finally {
    flushing = false;
  }
}

const queue = async (uid, op) => {
  const ops = await readJson(opsKey(uid), []);
  await writeJson(opsKey(uid), [...ops, op]);
  flushOps(uid);
};

export async function loadSubjects(uid) {
  let list;
  try {
    const snap = await withTimeout(getDocs(col(uid)));
    list = snap.docs.map((d) => ({ id: d.id, name: d.data().name })).filter((s) => s.name);
  } catch (e) {
    list = await readJson(cacheKey(uid), []);
  }
  // re-apply anything not uploaded yet
  for (const op of await readJson(opsKey(uid), [])) {
    list = list.filter((s) => s.id !== op.id);
    if (op.type === 'set') list.push({ id: op.id, name: op.name });
  }
  await writeJson(cacheKey(uid), list);
  return list;
}

export async function addSubject(uid, current, name) {
  const trimmed = name.trim();
  if (!trimmed || current.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return current;
  const id = doc(col(uid)).id;
  const next = [...current, { id, name: trimmed }];
  await writeJson(cacheKey(uid), next);
  await queue(uid, { type: 'set', id, name: trimmed });
  return next;
}

export async function renameSubject(uid, current, id, newName) {
  const trimmed = newName.trim();
  if (!trimmed) return current;
  const next = current.map((s) => (s.id === id ? { ...s, name: trimmed } : s));
  await writeJson(cacheKey(uid), next);
  await queue(uid, { type: 'set', id, name: trimmed });
  return next;
}

export async function deleteSubject(uid, current, id) {
  const next = current.filter((s) => s.id !== id);
  await writeJson(cacheKey(uid), next);
  await queue(uid, { type: 'delete', id });
  return next;
}

export async function deleteAll(uid) {
  try {
    const snap = await withTimeout(getDocs(col(uid)));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (e) {
    /* best effort */
  }
  await removeKey(cacheKey(uid));
  await removeKey(opsKey(uid));
}
