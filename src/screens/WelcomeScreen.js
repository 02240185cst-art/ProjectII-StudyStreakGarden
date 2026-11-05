import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Title, Body } from '../components/ui';
import { colors } from '../theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 72 }}>🌸</Text>
      <Title style={{ marginTop: 12 }}>Study Streak Garden</Title>
      <Body style={{ textAlign: 'center', color: colors.gray, marginBottom: 28 }}>{'Grow your focus.\nOne day at a time.'}</Body>
      <View style={{ width: '100%' }}>
        <Button title="Get started" onPress={() => navigation.navigate('Register')} />
        <Button title="I already have an account" kind="ghost" onPress={() => navigation.navigate('Login')} />
      </View>
    </Screen>
  );
}
