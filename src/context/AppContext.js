import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import NetInfo from '@react-native-community/netinfo';
import { auth } from '../firebase';
import * as Auth from '../services/auth';
import * as Users from '../services/users';
import * as Sessions from '../services/sessions';
import * as Subjects from '../services/subjects';
import * as Stats from '../services/stats';
import * as Garden from '../services/garden';
import { scheduleReminders } from '../services/notifications';
import { readJson, writeJson } from '../services/util';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export const DENSITIES = [
  { key: 'SPARSE', label: 'Sparse', columns: 1 },
  { key: 'COZY', label: 'Cozy', columns: 2 },
  { key: 'LUSH', label: 'Lush', columns: 3 },
];
const DEFAULT_PREFS = { remindersEnabled: true, reminderHour: 19, reminderMinute: 0, sessionSound: true, density: 'COZY' };

export function AppProvider({ children }) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [prefs, setPrefsState] = useState(DEFAULT_PREFS);
  const uidRef = useRef(null);

  // ---- preferences ----
  useEffect(() => {
    readJson('ssg:prefs', DEFAULT_PREFS).then((p) => setPrefsState({ ...DEFAULT_PREFS, ...p }));
  }, []);
  const setPrefs = useCallback((patch) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...patch };
      writeJson('ssg:prefs', next);
      return next;
    });
  }, []);

  // ---- data loading ----
  const refreshAll = useCallback(async (uid = uidRef.current) => {
    if (!uid) return;
    setLoading(true);
    try {
      await Sessions.flushPending(uid);
      await Subjects.flushOps(uid);
      const [p, s, sub, pend] = await Promise.all([
        Users.getProfile(uid), Sessions.loadSessions(uid), Subjects.loadSubjects(uid), Sessions.pendingCount(uid),
      ]);
      if (uidRef.current !== uid) return;
      setProfile(p);
      setSessions(s);
      setSubjects(sub);
      setPending(pend);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      uidRef.current = u ? u.uid : null;
      setUser(u);
      setAuthReady(true);
      if (u) refreshAll(u.uid);
      else {
        setProfile(null); setSessions([]); setSubjects([]); setPending(0); setNeedsSetup(false);
      }
    });
    return unsub;
  }, [refreshAll]);

  // ---- connectivity: sync queued sessions when we come back online ----
  useEffect(() => {
    const unsub = NetInfo.addEventListener(async (state) => {
      const isOnline = !!state.isConnected && state.isInternetReachable !== false;
      setOnline(isOnline);
      const uid = uidRef.current;
      if (isOnline && uid) {
        const sent = await Sessions.flushPending(uid);
        await Subjects.flushOps(uid);
        setPending(await Sessions.pendingCount(uid));
        if (sent > 0) refreshAll(uid);
      }
    });
    return unsub;
  }, [refreshAll]);

  // ---- derived values ----
  const stats = useMemo(() => {
    const current = Stats.currentStreak(sessions);
    const best = Stats.bestStreak(sessions);
    const achievements = Stats.getAchievements(sessions);
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    const earned = Garden.seedsEarned(sessions.length, unlockedCount);
    return {
      currentStreak: current,
      bestStreak: best,
      totalMinutes: Stats.totalMinutes(sessions),
      minutesToday: Stats.minutesToday(sessions),
      sessionCount: sessions.length,
      weekly: Stats.weeklyMinutes(sessions),
      achievements,
      plants: Garden.unlockedPlants(best),
      seedsEarned: earned,
      seedBalance: earned - ((profile && profile.seedsSpent) || 0),
      studiedToday: Stats.studiedToday(sessions),
    };
  }, [sessions, profile]);

  // ---- keep reminders in sync ----
  useEffect(() => {
    if (!user || loading) return;
    scheduleReminders({
      enabled: prefs.remindersEnabled, hour: prefs.reminderHour, minute: prefs.reminderMinute,
      studiedToday: stats.studiedToday,
    });
  }, [user, loading, prefs.remindersEnabled, prefs.reminderHour, prefs.reminderMinute, stats.studiedToday]);

  // ---- actions ----
  const actions = {
    refreshAll,
    setPrefs,
    setNeedsSetup,

    async registerUser({ name, studentId, email, password }) {
      setNeedsSetup(true);
      try {
        const cred = await Auth.register(email, password);
        await Users.createProfile(cred.user.uid, name.trim(), studentId.trim(), email.trim());
        await refreshAll(cred.user.uid);
      } catch (e) {
        setNeedsSetup(false);
        throw e;
      }
    },
    login: (email, password) => Auth.login(email, password),
    logout: () => Auth.logout(),
    changePassword: Auth.changePassword,
    deleteAccount: Auth.deleteAccount,

    async saveProfile(name, studentId) {
      await Users.updateProfile(user.uid, name.trim(), studentId.trim());
      setProfile((p) => ({ ...p, name: name.trim(), studentId: studentId.trim() }));
    },
    async savePhoto(photo) {
      await Users.savePhoto(user.uid, photo);
      setProfile((p) => ({ ...p, photo }));
    },
    async saveDailyGoal(minutes) {
      await Users.updateDailyGoal(user.uid, minutes);
      setProfile((p) => ({ ...p, dailyGoalMinutes: minutes }));
    },

    async addSession(subject, durationMinutes) {
      const s = await Sessions.addSession(user.uid, { subject, durationMinutes });
      setSessions((prev) => [...prev, s]);
      setPending(await Sessions.pendingCount(user.uid));
      return s;
    },

    async addSubject(name) { setSubjects(await Subjects.addSubject(user.uid, subjects, name)); },
    async renameSubject(id, name) { setSubjects(await Subjects.renameSubject(user.uid, subjects, id, name)); },
    async deleteSubject(id) { setSubjects(await Subjects.deleteSubject(user.uid, subjects, id)); },

    // Decoration shop (NEW)
    async buyDecoration(item) {
      if (stats.seedBalance < item.cost) throw new Error('Not enough seeds yet — keep studying!');
      const owned = [...(profile.ownedDecorations || []), item.id];
      const data = {
        seedsSpent: (profile.seedsSpent || 0) + item.cost,
        ownedDecorations: owned,
        activeBackground: item.kind === 'background' ? item.id : profile.activeBackground || null,
      };
      await Users.saveDecorations(user.uid, data);
      setProfile((p) => ({ ...p, ...data }));
    },
    async equipBackground(id) {
      await Users.saveDecorations(user.uid, { activeBackground: id });
      setProfile((p) => ({ ...p, activeBackground: id }));
    },
  };

  const value = { authReady, user, profile, sessions, subjects, loading, online, pending, needsSetup, prefs, stats, ...actions };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
