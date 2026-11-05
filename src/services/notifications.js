import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true,
    shouldPlaySound: true, shouldSetBadge: false,
  }),
});

export async function requestPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Study reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return !!asked.granted;
}

// Schedules the next 14 reminders as one-off notifications. If you've already studied today,
// today's reminder is skipped. Called on app start, after each session and when settings change.
export async function scheduleReminders({ enabled, hour, minute, studiedToday }) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;
    const types = Notifications.SchedulableTriggerInputTypes;
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute, 0);
      if (when <= now) continue;
      if (i === 0 && studiedToday) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Study Streak Garden 🌱', body: "Your garden is waiting — time for a focus session!" },
        trigger: types ? { type: types.DATE, date: when, channelId: 'reminders' } : when,
      });
    }
  } catch (e) {
    /* never crash the app because of notifications */
  }
}

export async function cancelReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {}
}
