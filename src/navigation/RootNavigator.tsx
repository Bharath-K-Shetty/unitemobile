import CreateEventScreen from '@/screens/CreateEventScreen';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import Navigation, { TabParamList } from './index';


export type RootStackParamList = {
  Onboarding: undefined;
  MainApp: NavigatorScreenParams<TabParamList>;
  CreateEvent: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainApp" component={Navigation} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ headerShown: false, title: 'Create Event' }} />
    </Stack.Navigator>
  );
}
