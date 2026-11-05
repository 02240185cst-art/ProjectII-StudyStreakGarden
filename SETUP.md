# Study Streak Garden — React Native (Project II)

Port of the Project I Kotlin app to React Native (Expo) for Android + iOS, with new Project II features.

## 1. Create the Expo project and copy these files in
```bash
npx create-expo-app@latest StudyStreakGarden --template blank
cd StudyStreakGarden
```
Delete the template's `App.js`, then copy everything from this folder
(`App.js`, `index.js`, `app.json`, `metro.config.js`, `babel.config.js`, `src/`, `assets/`, `firestore.rules`) into the new project, overwriting when asked.

> If the template uses `"main": "index.js"` in package.json already, fine. If it points elsewhere,
> set `"main": "index.js"` in package.json.

## 2. Install dependencies (let Expo pick compatible versions)
```bash
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context react-native-svg \
  @react-native-async-storage/async-storage @react-native-community/netinfo \
  expo-notifications expo-audio expo-sharing react-native-view-shot expo-status-bar
npm install firebase
```

## 3. Connect Firebase (your existing project `study-streak-garden`)
1. Firebase console -> Project settings -> **Your apps** -> **Add app -> Web (</>)**.
2. Copy the config values into `src/firebase.js` (`apiKey` and `appId` are the two placeholders).
3. Authentication -> Sign-in method -> make sure **Email/Password** is enabled (it already is for Project I).
4. Firestore -> Rules -> paste `firestore.rules` and publish.
   Existing Project I data works as-is (same `users/{uid}`, `/sessions`, `/subjects` structure).

## 4. Run
```bash
npx expo start
```
- Android: press `a` (Android Studio emulator) or scan the QR with Expo Go.
- iOS (on your Mac): press `i` (Xcode Simulator) or scan the QR with Expo Go on an iPhone.

Notes
- Local notifications work in Expo Go. For a standalone build use `npx eas build`.
- The first launch after login needs internet; after that sessions can be logged offline and sync later.

## What changed from Project I
| Feature | Status |
|---|---|
| Login / register / setup / home / subjects / timer / complete / garden / progress / achievements / profile / notifications / settings | Ported to React Native |
| Android + iOS from one codebase | New |
| Weekly analytics chart (Progress tab) | New |
| Offline-first session & subject sync (AsyncStorage queue + NetInfo) | New |
| Garden decorations shop (seeds earned from sessions/achievements) | New (optional feature) |
| Share progress card (image via share sheet) | New (optional feature) |

Behaviour notes: plants unlock from your **best** streak (a reset never removes plants), reminder is
re-planned for the next 14 days and skipped for today once you've studied, "Garden density" and all
settings are saved on the device.
