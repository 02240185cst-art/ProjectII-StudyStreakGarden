import React from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '../theme';

export default function Avatar({ photo, name = '', size = 76 }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'S';
  const base = { width: size, height: size, borderRadius: size / 2 };
  if (photo) return <Image source={{ uri: photo }} style={[base, { backgroundColor: colors.pale }]} resizeMode="cover" />;
  return (
    <View style={[base, { backgroundColor: colors.petalLilac, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ fontSize: size * 0.37, fontWeight: '700', color: colors.dark }}>{initials}</Text>
    </View>
  );
}