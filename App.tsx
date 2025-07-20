import './src/polyfills';

import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider, useThemeContext } from './src/context/ThemeContext';
import { WalletProvider } from './src/context/WalletContext';
import RootNavigator from './src/navigation/RootNavigator';



SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { theme } = useThemeContext();

  useEffect(() => {
    const prepare = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await SplashScreen.hideAsync();
    };
    prepare();
  }, []);

  return (
    <WalletProvider>
      <NavigationContainer theme={theme}>
        <RootNavigator />
      </NavigationContainer></WalletProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
