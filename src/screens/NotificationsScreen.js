import React from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { Screen, Muted, Body, Card, BackHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { requestPermission } from '../services/notifications';
import { colors } from '../theme';

const pad = (n) => String(n).padStart(2, '0');

function Stepper({ label, value, onMinus, onPlus }) {
  return (
    <View style={{ alignItems: 'center', marginHorizontal: 14 }}>
      <Muted>{label}</Muted>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <TouchableOpacity onPress={onMinus} style={btn}><Text style={btnText}>−</Text></TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.dark, width: 48, textAlign: 'center' }}>{pad(value)}</Text>
        <TouchableOpacity onPress={onPlus} style={btn}><Text style={btnText}>+</Text></TouchableOpacity>
      </View>
    </View>
  );
}
const btn = { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' };
const btnText = { fontSize: 20, color: colors.dark, fontWeight: '700' };

export default function NotificationsScreen({ navigation }) {
  const { prefs, setPrefs } = useApp();

  const toggleReminder = async (on) => {
    if (on) {
      const ok = await requestPermission();
      if (!ok) {
        Alert.alert('Notifications are off', 'You can enable notifications for Study Streak Garden in your phone settings, then try again.');
        return;
      }
    }
    setPrefs({ remindersEnabled: on });
  };

  return (
    <Screen>
      <BackHeader title="Notifications 🔔" onBack={() => navigation.goBack()} />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '700' }}>Daily study reminder</Body>
            <Muted>Get nudged if you haven't studied yet today</Muted>
          </View>
          <Switch value={prefs.remindersEnabled} onValueChange={toggleReminder} trackColor={{ true: colors.primary }} />
        </View>
      </Card>
      {prefs.remindersEnabled ? (
        <Card style={{ alignItems: 'center' }}>
          <Body style={{ fontWeight: '700', marginBottom: 8 }}>Reminder time</Body>
          <View style={{ flexDirection: 'row' }}>
            <Stepper label="Hour" value={prefs.reminderHour}
              onMinus={() => setPrefs({ reminderHour: (prefs.reminderHour + 23) % 24 })}
              onPlus={() => setPrefs({ reminderHour: (prefs.reminderHour + 1) % 24 })} />
            <Stepper label="Minute" value={prefs.reminderMinute}
              onMinus={() => setPrefs({ reminderMinute: (prefs.reminderMinute + 55) % 60 })}
              onPlus={() => setPrefs({ reminderMinute: (prefs.reminderMinute + 5) % 60 })} />
          </View>
        </Card>
      ) : null}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '700' }}>Session complete sound</Body>
            <Muted>Play a sound when a focus session finishes</Muted>
          </View>
          <Switch value={prefs.sessionSound} onValueChange={(v) => setPrefs({ sessionSound: v })} trackColor={{ true: colors.primary }} />
        </View>
      </Card>
    </Screen>
  );
}
