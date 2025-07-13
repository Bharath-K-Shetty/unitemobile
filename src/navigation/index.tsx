import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import React from 'react';

import EventScreen from '@/screens/EventScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';

export type TabParamList = {
  Unite: undefined;
  Events: undefined;
  Profile: undefined;
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
          } else if (route.name === 'Profile') {
            iconName = 'person-circle-outline';
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
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default Navigation;
