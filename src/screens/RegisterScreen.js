import React, { useState } from 'react';
import { Screen, Button, Title, Field, ErrorText, Muted, BackHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { friendlyError } from '../services/auth';

export default function RegisterScreen({ navigation }) {
  const { registerUser } = useApp();
  const [f, setF] = useState({ name: '', studentId: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!f.name.trim() || !f.studentId.trim() || !f.email.trim() || !f.password) return setError('Please fill in every field.');
    if (f.password.length < 6) return setError('Password must be at least 6 characters.');
    if (f.password !== f.confirm) return setError('Passwords do not match.');
    setError(''); setBusy(true);
    try { await registerUser(f); } catch (e) { setError(friendlyError(e)); setBusy(false); }
  };

  return (
    <Screen>
      <BackHeader onBack={() => navigation.goBack()} />
      <Title>Create your garden 🌱</Title>
      <Muted style={{ marginBottom: 18 }}>Needs an internet connection the first time.</Muted>
      <Field label="Full name" value={f.name} onChangeText={set('name')} placeholder="Full name" />
      <Field label="Student ID" value={f.studentId} onChangeText={set('studentId')} placeholder="Student ID" />
      <Field label="Email" value={f.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="student@example.com" />
      <Field label="Password" value={f.password} onChangeText={set('password')} secureTextEntry placeholder="At least 6 characters" />
      <Field label="Confirm password" value={f.confirm} onChangeText={set('confirm')} secureTextEntry placeholder="Repeat your password" />
      <ErrorText>{error}</ErrorText>
      <Button title="Create account" onPress={submit} loading={busy} />
      <Button title="Already have an account? Log in" kind="ghost" onPress={() => navigation.replace('Login')} />
    </Screen>
  );
}
