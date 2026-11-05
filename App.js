import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import { colors } from './src/theme';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SetupGardenScreen from './src/screens/SetupGardenScreen';
import HomeScreen from './src/screens/HomeScreen';
import GardenScreen from './src/screens/GardenScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SubjectScreen from './src/screens/SubjectScreen';
import FocusSessionScreen from './src/screens/FocusSessionScreen';
import SessionCompleteScreen from './src/screens/SessionCompleteScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icon = (emoji) => ({ focused }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.dark,
      tabBarInactiveTintColor: colors.gray,
      tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.pale },
    }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: icon('🏡') }} />
      <Tab.Screen name="Garden" component={GardenScreen} options={{ tabBarIcon: icon('🌷') }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarIcon: icon('📊') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: icon('👤') }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { authReady, user, needsSetup } = useApp();

  if (!authReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <Text style={{ fontSize: 56 }}>🌸</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={needsSetup ? 'Setup' : 'Main'}>
      <Stack.Screen name="Setup" component={SetupGardenScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Subject" component={SubjectScreen} />
      <Stack.Screen name="Focus" component={FocusSessionScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Complete" component={SessionCompleteScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Root />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
