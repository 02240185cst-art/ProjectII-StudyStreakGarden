import React, { useState } from 'react';
import { Screen, Button, Field, ErrorText, BackHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { Alert } from 'react-native';

export default function EditProfileScreen({ navigation }) {
  const { profile, user, saveProfile } = useApp();
  const [name, setName] = useState((profile && profile.name) || '');
  const [studentId, setStudentId] = useState((profile && profile.studentId) || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name.trim() || !studentId.trim()) return setError('Name and student ID cannot be empty.');
    setBusy(true); setError('');
    try {
      await saveProfile(name, studentId);
      Alert.alert('Saved', 'Your profile was updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      setError('Could not save — check your internet connection.');
    }
    setBusy(false);
  };

  return (
    <Screen>
      <BackHeader title="Edit profile ✏️" onBack={() => navigation.goBack()} />
      <Field label="Full name" value={name} onChangeText={setName} />
      <Field label="Student ID" value={studentId} onChangeText={setStudentId} />
      <Field label="Email (cannot be changed)" value={(user && user.email) || ''} editable={false} />
      <ErrorText>{error}</ErrorText>
      <Button title="Save changes" onPress={save} loading={busy} />
    </Screen>
  );
}
