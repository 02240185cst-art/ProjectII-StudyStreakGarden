
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAHAxPZepcEV-OfoP3zaq5VcxTl6AG7RqI',
  authDomain: 'study-streak-garden.firebaseapp.com',
  projectId: 'study-streak-garden',
  storageBucket: 'study-streak-garden.firebasestorage.app',
  messagingSenderId: '278275414276',
  appId: '1:278275414276:web:3ec4d2d53e2921fcd6d851',
  measurementId: 'G-CFHH9J7HNX',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { app, auth };
export const db = getFirestore(app);
