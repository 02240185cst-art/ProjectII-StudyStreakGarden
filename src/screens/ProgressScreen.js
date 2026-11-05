import React, { useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Screen, Title, Muted, Body, Card, Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import { formatHM } from '../services/stats';
import { colors } from '../theme';

const CHART_H = 120;

// NEW in Project II: weekly analytics chart (plain Views, no chart library needed).
function WeeklyChart({ data }) {
  const max = Math.max(30, ...data.map((d) => d.minutes));
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: CHART_H + 18 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Muted style={{ fontSize: 11, marginBottom: 2 }}>{d.minutes > 0 ? d.minutes : ''}</Muted>
            <View style={{
              width: 22, height: Math.max(4, (d.minutes / max) * CHART_H), borderRadius: 6,
              backgroundColor: d.isToday ? colors.primary : colors.lavender,
            }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        {data.map((d, i) => (
          <Muted key={i} style={{ flex: 1, textAlign: 'center', fontWeight: d.isToday ? '700' : '400' }}>{d.label}</Muted>
        ))}
      </View>
    </View>
  );
}

export default function ProgressScreen({ navigation }) {
  const { stats, profile } = useApp();
  const cardRef = useRef(null);
  const weekTotal = stats.weekly.reduce((a, d) => a + d.minutes, 0);

  const share = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) return Alert.alert('Sharing not available on this device');
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share my progress' });
    } catch (e) {
      Alert.alert('Could not create the card', 'Please try again.');
    }
  };

  return (
    <Screen>
      <Title>Your progress</Title>
      <Card><Muted>Total study time</Muted><Text style={{ fontSize: 22, fontWeight: '700', color: colors.dark }}>{formatHM(stats.totalMinutes)}</Text></Card>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1 }}><Muted>Current streak</Muted><Text style={{ fontSize: 20, fontWeight: '700', color: colors.dark }}>🔥 {stats.currentStreak} days</Text></Card>
        <Card style={{ flex: 1 }}><Muted>Study sessions</Muted><Text style={{ fontSize: 20, fontWeight: '700', color: colors.dark }}>{stats.sessionCount}</Text></Card>
      </View>

      <Card>
        <Body style={{ fontWeight: '700' }}>Focused study time · last 7 days</Body>
        <Muted style={{ marginBottom: 12 }}>{formatHM(weekTotal)} this week (minutes per day)</Muted>
        <WeeklyChart data={stats.weekly} />
      </Card>

      <Button title="Achievements 🏆" kind="secondary" onPress={() => navigation.navigate('Achievements')} />

      <Body style={{ fontWeight: '700', marginTop: 20, marginBottom: 8 }}>Share your progress</Body>
      <View ref={cardRef} collapsable={false} style={{ backgroundColor: colors.pale, borderRadius: 20, padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: colors.gray }}>Study Streak Garden</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.dark, marginTop: 4 }}>{(profile && profile.name) || 'My garden'}</Text>
        <Text style={{ fontSize: 40, fontWeight: '700', color: colors.dark, marginVertical: 6 }}>🔥 {stats.currentStreak}</Text>
        <Muted>day streak · best {stats.bestStreak}</Muted>
        <Text style={{ fontSize: 28, marginTop: 10, textAlign: 'center' }}>{stats.plants.length ? stats.plants.map((p) => p.emoji).join(' ') : '🌱'}</Text>
        <Muted style={{ marginTop: 8 }}>{formatHM(stats.totalMinutes)} focused · {stats.sessionCount} sessions</Muted>
      </View>
      <Button title="Share progress card" onPress={share} />
    </Screen>
  );
}
