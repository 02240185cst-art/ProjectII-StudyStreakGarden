import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Screen, Title, Muted, Body, Card, Button, ModalSheet } from '../components/ui';
import Avatar from '../components/Avatar';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

function Row({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.pale }}>
      <Text style={{ fontSize: 20, width: 34 }}>{icon}</Text>
      <Body style={{ flex: 1 }}>{label}</Body>
      <Text style={{ color: colors.gray, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { profile, stats, logout, savePhoto } = useApp();
  const name = (profile && profile.name) || 'Student';
  const photo = profile && profile.photo;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Shrink to a small square JPEG (~20-40 KB) so it fits comfortably in the Firestore profile document.
  const processAndSave = async (uri) => {
    setBusy(true);
    try {
      const out = await ImageManipulator.manipulateAsync(
        uri, [{ resize: { width: 256 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      await savePhoto(`data:image/jpeg;base64,${out.base64}`);
    } catch (e) {
      Alert.alert('Could not save photo', 'Please check your internet connection and try again.');
    }
    setBusy(false);
  };

  const pick = async (fromCamera) => {
    setSheetOpen(false);
    const perm = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert('Permission needed', `Allow ${fromCamera ? 'camera' : 'photo'} access in your phone settings to set a profile picture.`);
    }
    const options = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 };
    const result = fromCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets && result.assets[0]) processAndSave(result.assets[0].uri);
  };

  const removePhoto = async () => {
    setSheetOpen(false);
    setBusy(true);
    try { await savePhoto(null); } catch (e) { Alert.alert('Could not remove photo', 'Please try again.'); }
    setBusy(false);
  };

  const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out of Study Streak Garden?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => setSheetOpen(true)} activeOpacity={0.8} disabled={busy}>
          <Avatar photo={photo} name={name} size={96} />
          <View style={{ position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.cream }}>
            {busy ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={{ fontSize: 14 }}>📷</Text>}
          </View>
        </TouchableOpacity>
        <Title style={{ marginTop: 10, marginBottom: 0 }}>{name}</Title>
        <Muted>{(profile && profile.studentId) || ''} • Student</Muted>
        <Muted style={{ marginTop: 4 }}>{stats.bestStreak} day best streak · {stats.sessionCount} study sessions</Muted>
      </View>

      <Card>
        <Row icon="✏️" label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
        <Row icon="📚" label="Manage subjects" onPress={() => navigation.navigate('Subject', { manageOnly: true })} />
        <Row icon="🎯" label="Study goals" onPress={() => navigation.navigate('Setup', { fromProfile: true })} />
        <Row icon="🔔" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
        <Row icon="⚙️" label="Settings" onPress={() => navigation.navigate('Settings')} />
      </Card>
      <Button title="Log out" kind="secondary" onPress={confirmLogout} />

      <ModalSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Profile photo">
        <Button title="📷  Take a photo" onPress={() => pick(true)} />
        <Button title="🖼️  Choose from library" kind="secondary" onPress={() => pick(false)} />
        {photo ? <Button title="Remove photo" kind="ghost" onPress={removePhoto} /> : null}
        <Button title="Cancel" kind="ghost" onPress={() => setSheetOpen(false)} />
      </ModalSheet>
    </Screen>
  );
}
