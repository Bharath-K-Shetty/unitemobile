import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import React from 'react';

import EventScreen from '@/screens/EventScreen';
import StayScreen from '@/screens/StayScreen';
import HomeScreen from '../screens/HomeScreen';

export type TabParamList = {
  Unite: undefined;
  Events: undefined;
  Stay: undefined
};

const Tab = createBottomTabNavigator<TabParamList>();

const Navigation = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Unite"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Unite') {
            iconName = 'home-outline';
          } else if (route.name === 'Events') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Stay') {
            iconName = 'bed-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#D0FF00",
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="Unite" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventScreen} />

      <Tab.Screen name="Stay" component={StayScreen} />
    </Tab.Navigator>
  );
};

export default Navigation;
