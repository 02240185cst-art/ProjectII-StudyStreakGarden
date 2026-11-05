// Pure helpers — all streak / progress maths lives here (ported from StudyRepository.kt).
const DAY = 24 * 60 * 60 * 1000;

// Local calendar day number (so "today" follows the phone's timezone).
export const dayNumber = (ts) => {
  const d = new Date(ts);
  return Math.floor((ts - d.getTimezoneOffset() * 60000) / DAY);
};

export const totalMinutes = (sessions) => sessions.reduce((s, x) => s + (x.durationMinutes || 0), 0);

export const minutesToday = (sessions) => {
  const today = dayNumber(Date.now());
  return sessions.filter((s) => dayNumber(s.date) === today).reduce((a, s) => a + (s.durationMinutes || 0), 0);
};

export const currentStreak = (sessions) => {
  const days = new Set(sessions.map((s) => dayNumber(s.date)));
  if (days.size === 0) return 0;
  let streak = 0;
  let day = dayNumber(Date.now());
  if (!days.has(day)) day -= 1;
  while (days.has(day)) {
    streak += 1;
    day -= 1;
  }
  return streak;
};

export const bestStreak = (sessions) => {
  const days = [...new Set(sessions.map((s) => dayNumber(s.date)))].sort((a, b) => a - b);
  if (days.length === 0) return 0;
  let best = 1;
  let cur = 1;
  for (let i = 1; i < days.length; i++) {
    cur = days[i] === days[i - 1] + 1 ? cur + 1 : 1;
    if (cur > best) best = cur;
  }
  return best;
};

export const studiedToday = (sessions) => minutesToday(sessions) > 0 || sessions.some((s) => dayNumber(s.date) === dayNumber(Date.now()));

// NEW (Project II): minutes studied for each of the last 7 days, oldest first.
export const weeklyMinutes = (sessions) => {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = dayNumber(Date.now());
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const dn = today - i;
    const minutes = sessions.filter((s) => dayNumber(s.date) === dn).reduce((a, s) => a + (s.durationMinutes || 0), 0);
    const date = new Date(Date.now() - i * DAY);
    out.push({ label: labels[date.getDay()], minutes, isToday: i === 0 });
  }
  return out;
};

export const formatHM = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

export const getAchievements = (sessions) => {
  const count = sessions.length;
  const best = bestStreak(sessions);
  return [
    { title: 'First Seed', description: 'Complete your first study session', emoji: '🌱', unlocked: count >= 1 },
    { title: '7 Day Streak', description: 'Study for seven days in a row', emoji: '🔥', unlocked: best >= 7 },
    { title: '10 Sessions', description: 'Complete ten study sessions', emoji: '📚', unlocked: count >= 10 },
  ];
};
