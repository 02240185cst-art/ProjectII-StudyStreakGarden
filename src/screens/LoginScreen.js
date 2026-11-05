import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Screen, Button, Title, Field, ErrorText, Muted, BackHeader, ModalSheet } from '../components/ui';
import { useApp } from '../context/AppContext';
import { friendlyError, resetPassword } from '../services/auth';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // forgot-password dialog
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetBusy, setResetBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return setError('Please enter your email and password.');
    setError(''); setBusy(true);
    try { await login(email, password); } catch (e) { setError(friendlyError(e)); setBusy(false); }
  };

  const openForgot = () => { setResetEmail(email); setResetError(''); setForgotOpen(true); };

  const sendReset = async () => {
    if (!resetEmail.trim()) return setResetError('Please enter your email address.');
    setResetBusy(true); setResetError('');
    try {
      await resetPassword(resetEmail);
      setForgotOpen(false);
      Alert.alert('Check your email', `If an account exists for ${resetEmail.trim()}, a password reset link has been sent. Check your spam folder too.`);
    } catch (e) {
      setResetError(friendlyError(e));
    }
    setResetBusy(false);
  };

  return (
    <Screen>
      <BackHeader onBack={() => navigation.goBack()} />
      <Title>Welcome back 🌿</Title>
      <Muted style={{ marginBottom: 18 }}>Pick up where you left off.</Muted>
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="student@example.com" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" />
      <View style={{ alignItems: 'flex-end', marginBottom: 4 }}>
        <TouchableOpacity onPress={openForgot} hitSlop={8}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <ErrorText>{error}</ErrorText>
      <Button title="Log in" onPress={submit} loading={busy} />
      <Button title="New here? Create an account" kind="ghost" onPress={() => navigation.replace('Register')} />

      <ModalSheet visible={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset your password">
        <Muted style={{ marginBottom: 10 }}>Enter your account email and we'll send you a link to choose a new password.</Muted>
        <Field label="Email" value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" keyboardType="email-address" placeholder="student@example.com" />
        <ErrorText>{resetError}</ErrorText>
        <Button title="Send reset link" onPress={sendReset} loading={resetBusy} />
        <Button title="Cancel" kind="ghost" onPress={() => setForgotOpen(false)} />
      </ModalSheet>
    </Screen>
  );
}
