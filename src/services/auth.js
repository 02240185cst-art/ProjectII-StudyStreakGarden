import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import * as Users from './users';
import * as Sessions from './sessions';
import * as Subjects from './subjects';

export const register = (email, password) => createUserWithEmailAndPassword(auth, email.trim(), password);
export const login = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);
export const logout = () => signOut(auth);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());

async function reauth(currentPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not logged in');
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
  return user;
}

export async function changePassword(currentPassword, newPassword) {
  const user = await reauth(currentPassword);
  await updatePassword(user, newPassword);
}

export async function deleteAccount(currentPassword) {
  const user = await reauth(currentPassword);
  const uid = user.uid;
  await Sessions.deleteAll(uid);
  await Subjects.deleteAll(uid);
  await Users.deleteProfile(uid);
  await deleteUser(user);
}

// Friendly messages for Firebase error codes.
export function friendlyError(e) {
  const code = e && e.code ? e.code : '';
  if (code.includes('user-not-found') && code.includes('reset')) return 'No account found with that email.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Email or password is incorrect.';
  if (code.includes('email-already-in-use')) return 'That email is already registered.';
  if (code.includes('weak-password')) return 'Password must be at least 6 characters.';
  if (code.includes('invalid-email')) return 'Please enter a valid email address.';
  if (code.includes('network')) return 'No internet connection. Please try again.';
  if (code.includes('requires-recent-login')) return 'Please log in again and retry.';
  return (e && e.message) || 'Something went wrong.';
}
