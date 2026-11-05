import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Screen, Title, Muted, Body, Card, ProgressBar, Button, ModalSheet } from '../components/ui';
import { useApp, DENSITIES } from '../context/AppContext';
import { DECORATIONS, daysToNextFlower } from '../services/garden';
import { colors } from '../theme';

export default function GardenScreen() {
  const { stats, profile, prefs, buyDecoration, equipBackground } = useApp();
  const [shopOpen, setShopOpen] = useState(false);
  const plants = stats.plants;
  const cols = (DENSITIES.find((d) => d.key === prefs.density) || DENSITIES[1]).columns;
  const owned = (profile && profile.ownedDecorations) || [];
  const activeBg = DECORATIONS.find((d) => d.id === (profile && profile.activeBackground));
  const hasFence = owned.includes('fence');
  const hasPots = owned.includes('pots');
  const next = daysToNextFlower(stats.currentStreak);

  const buy = async (item) => {
    try { await buyDecoration(item); } catch (e) { Alert.alert('Cannot buy yet', e.message || 'Please try again.'); }
  };

  return (
    <Screen>
      <Title>My garden 🌷</Title>
      <Muted>{plants.length} plants growing</Muted>

      <Card style={{ marginTop: 12 }}>
        <Body>{next}/10 days to your next new flower</Body>
        <ProgressBar value={next / 10} />
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Body style={{ fontWeight: '700' }}>🌰 {stats.seedBalance} seeds</Body>
        <Button title="Decorate" kind="secondary" onPress={() => setShopOpen(true)} style={{ marginTop: 0, paddingVertical: 8, paddingHorizontal: 16 }} />
      </View>

      <View style={{ backgroundColor: (activeBg && activeBg.color) || colors.pale, borderRadius: 20, padding: 12, minHeight: 200 }}>
        {hasFence ? <Text style={{ textAlign: 'center', fontSize: 18 }}>{'🪵'.repeat(10)}</Text> : null}
        {plants.length === 0 ? (
          <Body style={{ textAlign: 'center', padding: 30, color: colors.gray }}>Complete your first study session to plant your first seed 🌱</Body>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {plants.map((p, i) => (
              <View key={i} style={{ width: `${100 / cols}%`, padding: 6 }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, alignItems: 'center', paddingVertical: 14 }}>
                  <Text style={{ fontSize: cols === 3 ? 40 : cols === 2 ? 52 : 64 }}>{p.emoji}</Text>
                  {hasPots ? <Text style={{ fontSize: 22, marginTop: -6 }}>🪴</Text> : null}
                  <Muted style={{ marginTop: 4 }}>{p.name}</Muted>
                </View>
              </View>
            ))}
          </View>
        )}
        {plants.length >= 9 ? <Muted style={{ textAlign: 'center', marginTop: 8 }}>New seed coming soon 🌱</Muted> : null}
        {hasFence ? <Text style={{ textAlign: 'center', fontSize: 18 }}>{'🪵'.repeat(10)}</Text> : null}
      </View>

      <ModalSheet visible={shopOpen} onClose={() => setShopOpen(false)} title={`Garden shop · 🌰 ${stats.seedBalance} seeds`}>
        <Muted style={{ marginBottom: 10 }}>Earn 1 seed per session and 5 for each achievement.</Muted>
        {DECORATIONS.map((item) => {
          const isOwned = owned.includes(item.id);
          const isActive = profile && profile.activeBackground === item.id;
          return (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 26, width: 40 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: '600' }}>{item.name}</Body>
                <Muted>{isOwned ? 'Owned' : `${item.cost} seeds`}</Muted>
              </View>
              {isOwned && item.kind === 'background' ? (
                <TouchableOpacity onPress={() => equipBackground(item.id)}><Text style={{ color: colors.primary, fontWeight: '700' }}>{isActive ? 'In use' : 'Use'}</Text></TouchableOpacity>
              ) : !isOwned ? (
                <TouchableOpacity onPress={() => buy(item)}><Text style={{ color: stats.seedBalance >= item.cost ? colors.primary : colors.gray, fontWeight: '700' }}>Buy</Text></TouchableOpacity>
              ) : <Text style={{ color: colors.gray }}>✓</Text>}
            </View>
          );
        })}
        <Button title="Close" kind="secondary" onPress={() => setShopOpen(false)} />
      </ModalSheet>
    </Screen>
  );
}
