import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Title, Muted, Body, Card, BackHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export default function AchievementsScreen({ navigation }) {
  const { stats } = useApp();
  return (
    <Screen>
      <BackHeader title="Achievements 🏆" onBack={() => navigation.goBack()} />
      {stats.achievements.map((a) => (
        <Card key={a.title} tint={a.unlocked ? colors.petalButter : colors.white} style={{ opacity: a.unlocked ? 1 : 0.6, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 34, marginRight: 14 }}>{a.unlocked ? a.emoji : '🔒'}</Text>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '700' }}>{a.title}</Body>
            <Muted>{a.description}</Muted>
          </View>
        </Card>
      ))}
      <Muted style={{ textAlign: 'center', marginTop: 8 }}>Each achievement also earns 5 garden seeds 🌰</Muted>
    </Screen>
  );
}
