import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Screen, Button, Title, Muted, Body, BackHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { playChime } from '../services/sound';
import { colors } from '../theme';

const SIZE = 240;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const pad = (n) => String(n).padStart(2, '0');

export default function FocusSessionScreen({ navigation, route }) {
  const { subject } = route.params;
  const { addSession, prefs, stats } = useApp();
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [saving, setSaving] = useState(false);
  const startedAt = useRef(null);   // timestamp when the current run began
  const banked = useRef(0);         // ms accumulated from earlier runs (before pauses)

  // Derive time from timestamps so the timer stays correct if the app is backgrounded.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsedMs(banked.current + (Date.now() - startedAt.current)), 250);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) {
      banked.current += Date.now() - startedAt.current;
      setElapsedMs(banked.current);
      setRunning(false);
    } else {
      startedAt.current = Date.now();
      setRunning(true);
    }
  };

  const finish = async () => {
    const total = running ? banked.current + (Date.now() - startedAt.current) : banked.current;
    if (total < 1000) return Alert.alert('Nothing to save yet', 'Start the timer and study for a little while first.');
    setRunning(false); setSaving(true);
    const minutes = Math.max(1, Math.round(total / 60000));
    const before = stats.plants.length;
    try {
      await addSession(subject, minutes);
      if (prefs.sessionSound) playChime();
      navigation.replace('Complete', { minutes, subject, plantsBefore: before });
    } catch (e) {
      setSaving(false);
      Alert.alert('Could not save session', 'Please try again.');
    }
  };

  const secs = Math.floor(elapsedMs / 1000);
  const progress = (secs % 3600) / 3600;

  return (
    <Screen>
      <BackHeader onBack={() => (running ? Alert.alert('Session running', 'Tap Finish to save it first.') : navigation.goBack())} />
      <Title style={{ textAlign: 'center' }}>{subject}</Title>
      <Muted style={{ textAlign: 'center', marginBottom: 24 }}>{running ? 'Keep going 🌿' : 'Ready when you are 🌱'}</Muted>

      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.pale} strokeWidth={STROKE} fill="none" />
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.primary} strokeWidth={STROKE} fill="none"
            strokeDasharray={`${C} ${C}`} strokeDashoffset={C * (1 - progress)} strokeLinecap="round" />
        </Svg>
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text style={{ fontSize: 44, fontWeight: '700', color: colors.dark }}>
            {pad(Math.floor(secs / 3600))}:{pad(Math.floor((secs % 3600) / 60))}:{pad(secs % 60)}
          </Text>
          <Body style={{ color: colors.gray }}>focused</Body>
        </View>
      </View>

      <Button title={running ? 'Pause' : elapsedMs > 0 ? 'Resume' : 'Start'} onPress={toggle} disabled={saving} />
      <Button title="Finish" kind="secondary" onPress={finish} loading={saving} />
    </Screen>
  );
}
