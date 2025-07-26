import { NavigatorScreenParams } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';

import CreateEventScreen from '@/screens/CreateEventScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import Navigation, { TabParamList } from './index';

export type RootStackParamList = {
  Onboarding: undefined;
  MainApp: NavigatorScreenParams<TabParamList>;
  CreateEvent: undefined;
  ProfileScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      const walletAddress = await SecureStore.getItemAsync('wallet_address');
      if (walletAddress) {
        setInitialRoute('MainApp');
      } else {
        setInitialRoute('Onboarding');
      }
    };

    checkWallet();
  }, []);

  if (!initialRoute) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainApp" component={Navigation} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
