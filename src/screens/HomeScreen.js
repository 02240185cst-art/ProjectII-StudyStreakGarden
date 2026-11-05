import React, { useCallback } from 'react';
import { View, Text, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Body, Muted, ProgressBar, OfflineBanner } from '../components/ui';
import { useApp } from '../context/AppContext';
import { formatHM } from '../services/stats';
import { colors } from '../theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function HomeScreen({ navigation }) {
  const { profile, stats, loading, refreshAll, online, pending } = useApp();
  const goal = (profile && profile.dailyGoalMinutes) || 120;
  const name = (profile && profile.name) || '';
  const onRefresh = useCallback(() => refreshAll(), [refreshAll]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <OfflineBanner online={online} pending={pending} />
        <Title>{greeting()}, {name || 'friend'} ✨</Title>

        <Card tint={colors.pale} style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.dark }}>🔥 {stats.currentStreak} day streak</Text>
          <Muted style={{ marginTop: 4 }}>{stats.currentStreak > 0 ? "You're doing amazing!" : 'Start today to begin your streak'}</Muted>
        </Card>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Muted>Plants</Muted>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.dark }}>🌷 {stats.plants.length}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Muted>Study time today</Muted>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.dark }}>{formatHM(stats.minutesToday)}</Text>
          </Card>
        </View>

        <Card>
          <Body style={{ fontWeight: '700' }}>Today's goal</Body>
          <Muted style={{ marginTop: 2 }}>{formatHM(stats.minutesToday)} / {formatHM(goal)}</Muted>
          <ProgressBar value={stats.minutesToday / goal} />
        </Card>

        <Button title="Start a study session" onPress={() => navigation.navigate('Subject')} />
        <Muted style={{ textAlign: 'center', marginTop: 12 }}>Ready when you are 🌱</Muted>
      </ScrollView>
    </SafeAreaView>
  );
}
