import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Screen, Button, Title, Muted, Field, BackHeader, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

// Used both for choosing a subject before a session and for "Manage subjects" from Profile.
export default function SubjectScreen({ navigation, route }) {
  const { subjects, addSubject, renameSubject, deleteSubject } = useApp();
  const manageOnly = route.params && route.params.manageOnly;
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const add = async () => { if (newName.trim()) { await addSubject(newName); setNewName(''); } };
  const saveEdit = async () => { await renameSubject(editingId, editName); setEditingId(null); };
  const confirmDelete = (s) =>
    Alert.alert('Delete subject?', `"${s.name}" will be removed from your list. Past sessions are kept.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteSubject(s.id); if (selected === s.id) setSelected(null); } },
    ]);

  const chosen = subjects.find((s) => s.id === selected);

  return (
    <Screen>
      <BackHeader title={manageOnly ? 'Manage subjects 📚' : 'Choose a subject 📚'} onBack={() => navigation.goBack()} />
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}><Field value={newName} onChangeText={setNewName} placeholder="Add a subject (e.g. Mathematics)" onSubmitEditing={add} /></View>
        <Button title="Add" onPress={add} style={{ paddingHorizontal: 18, marginBottom: 12 }} />
      </View>

      {subjects.length === 0 ? <Muted style={{ textAlign: 'center', marginVertical: 24 }}>No subjects yet — add your first one above.</Muted> : null}

      {subjects.map((s) => (
        <Card key={s.id} tint={selected === s.id ? colors.petalLilac : colors.white} style={{ paddingVertical: 12 }}>
          {editingId === s.id ? (
            <View>
              <Field value={editName} onChangeText={setEditName} autoFocus />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button title="Save" onPress={saveEdit} style={{ flex: 1 }} />
                <Button title="Cancel" kind="secondary" onPress={() => setEditingId(null)} style={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => !manageOnly && setSelected(s.id)}>
                <Text style={{ fontSize: 16, color: colors.text, fontWeight: selected === s.id ? '700' : '400' }}>{s.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditingId(s.id); setEditName(s.name); }} style={{ padding: 8 }}><Text>✏️</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(s)} style={{ padding: 8 }}><Text>🗑️</Text></TouchableOpacity>
            </View>
          )}
        </Card>
      ))}

      {!manageOnly ? (
        <Button title="Continue" disabled={!chosen} onPress={() => navigation.navigate('Focus', { subject: chosen.name })} />
      ) : null}
    </Screen>
  );
}
