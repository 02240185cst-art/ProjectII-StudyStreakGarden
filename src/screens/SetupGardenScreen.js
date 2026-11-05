import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Screen, Button, Title, Body, Muted, BackHeader, ErrorText } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const GOALS = ['Study consistently', 'Track focused time', 'Build a daily streak'];
const TIMES = [{ label: '30 min', minutes: 30 }, { label: '1 hour', minutes: 60 }, { label: '2 hours', minutes: 120 }];

function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{
      paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, marginRight: 8, marginBottom: 8,
      backgroundColor: selected ? colors.primary : colors.white, borderWidth: 1, borderColor: colors.lavender,
    }}>
      <Text style={{ color: selected ? colors.white : colors.text, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function SetupGardenScreen({ navigation, route }) {
  const { profile, saveDailyGoal, setNeedsSetup } = useApp();
  const fromProfile = route.params && route.params.fromProfile;
  const [goal, setGoal] = useState(GOALS[2]);
  const [minutes, setMinutes] = useState((profile && profile.dailyGoalMinutes) || 120);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const finish = async () => {
    setBusy(true); setError('');
    try {
      await saveDailyGoal(minutes);
      setNeedsSetup(false);
      if (fromProfile) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      setError('Could not save — check your internet connection.');
      setBusy(false);
    }
  };

  return (
    <Screen>
      {fromProfile ? <BackHeader onBack={() => navigation.goBack()} /> : null}
      <Title>Set up your garden 🌱</Title>
      <Muted style={{ marginBottom: 20 }}>A couple of quick choices to personalise your goal.</Muted>
      <Body style={{ fontWeight: '700', marginBottom: 8 }}>What do you want to grow?</Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
        {GOALS.map((g) => <Chip key={g} label={g} selected={goal === g} onPress={() => setGoal(g)} />)}
      </View>
      <Body style={{ fontWeight: '700', marginBottom: 8 }}>Daily study goal</Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
        {TIMES.map((t) => <Chip key={t.minutes} label={t.label} selected={minutes === t.minutes} onPress={() => setMinutes(t.minutes)} />)}
      </View>
      <ErrorText>{error}</ErrorText>
      <Button title="Create my garden" onPress={finish} loading={busy} />
    </Screen>
  );
}
