import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Screen, Muted, Body, Card, BackHeader, ModalSheet, Field, Button, ErrorText } from '../components/ui';
import { useApp, DENSITIES } from '../context/AppContext';
import { friendlyError } from '../services/auth';
import { colors } from '../theme';

export default function SettingsScreen({ navigation }) {
  const { prefs, setPrefs, changePassword, deleteAccount } = useApp();
  const [pwOpen, setPwOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const closeAll = () => { setPwOpen(false); setDelOpen(false); setCur(''); setNext(''); setConfirm(''); setError(''); setBusy(false); };

  const updatePw = async () => {
    if (!cur) return setError('Enter your current password.');
    if (next.length < 6) return setError('New password must be at least 6 characters.');
    if (next !== confirm) return setError('New passwords do not match.');
    setBusy(true); setError('');
    try { await changePassword(cur, next); closeAll(); Alert.alert('Password updated', 'Your password was changed.'); }
    catch (e) { setError(friendlyError(e)); setBusy(false); }
  };

  const doDelete = async () => {
    if (!cur) return setError('Enter your password to confirm.');
    setBusy(true); setError('');
    try { await deleteAccount(cur); closeAll(); } // auth listener sends you back to the welcome screen
    catch (e) { setError(friendlyError(e)); setBusy(false); }
  };

  return (
    <Screen>
      <BackHeader title="Settings ⚙️" onBack={() => navigation.goBack()} />
      <Body style={{ fontWeight: '700', marginBottom: 2 }}>Garden density</Body>
      <Muted style={{ marginBottom: 8 }}>How many plants are shown per row in your garden</Muted>
      <Card>
        {DENSITIES.map((d) => (
          <TouchableOpacity key={d.key} onPress={() => setPrefs({ density: d.key })} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              {prefs.density === d.key ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} /> : null}
            </View>
            <Body>{d.label} ({d.columns} per row)</Body>
          </TouchableOpacity>
        ))}
      </Card>

      <Body style={{ fontWeight: '700', marginTop: 12, marginBottom: 8 }}>Account</Body>
      <Card>
        <TouchableOpacity onPress={() => setPwOpen(true)} style={{ paddingVertical: 10 }}><Body>🔑  Change password</Body></TouchableOpacity>
        <TouchableOpacity onPress={() => setDelOpen(true)} style={{ paddingVertical: 10 }}><Text style={{ color: colors.danger, fontSize: 15 }}>🗑️  Delete account</Text></TouchableOpacity>
      </Card>

      <ModalSheet visible={pwOpen} onClose={closeAll} title="Change password">
        <Field label="Current password" value={cur} onChangeText={setCur} secureTextEntry />
        <Field label="New password" value={next} onChangeText={setNext} secureTextEntry />
        <Field label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry />
        <ErrorText>{error}</ErrorText>
        <Button title="Update" onPress={updatePw} loading={busy} />
        <Button title="Cancel" kind="ghost" onPress={closeAll} />
      </ModalSheet>

      <ModalSheet visible={delOpen} onClose={closeAll} title="Delete account?">
        <Muted style={{ marginBottom: 10 }}>This permanently removes your account and all study data. It cannot be undone.</Muted>
        <Field label="Password" value={cur} onChangeText={setCur} secureTextEntry />
        <ErrorText>{error}</ErrorText>
        <Button title="Delete" kind="danger" onPress={doDelete} loading={busy} />
        <Button title="Cancel" kind="ghost" onPress={closeAll} />
      </ModalSheet>
    </Screen>
  );
}
