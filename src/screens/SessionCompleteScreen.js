import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Title, Body, Muted, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export default function SessionCompleteScreen({ navigation, route }) {
  const { minutes, subject } = route.params;
  const { stats } = useApp();
  // plants grow with your best streak, so more plants than before = a new flower this session
  const newFlower = stats.plants.length > (route.params.plantsBefore || 0);

  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 72 }}>🌸</Text>
      <Title style={{ marginTop: 8 }}>Session complete!</Title>
      <Muted style={{ marginBottom: 18 }}>{subject} · {minutes} min</Muted>
      <Card tint={colors.pale} style={{ width: '100%', alignItems: 'center' }}>
        <Body style={{ fontWeight: '700' }}>You made progress today +1</Body>
        <Muted style={{ marginTop: 6 }}>🔥 {stats.currentStreak} day streak</Muted>
      </Card>
      <Card style={{ width: '100%', alignItems: 'center' }}>
        <Body style={{ fontWeight: '700' }}>{newFlower ? 'New flower planted!' : 'Keep growing your garden!'}</Body>
        <Muted style={{ marginTop: 4 }}>Your garden grew 🌿</Muted>
      </Card>
      <View style={{ width: '100%' }}>
        <Button title="Back to my garden" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Garden' } }] })} />
        <Button title="Done" kind="secondary" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} />
      </View>
    </Screen>
  );
}
