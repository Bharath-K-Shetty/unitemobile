import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';


type NavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavProp>();

  const [fontsLoaded] = useFonts({
    'Audiowide': require('../../assets/fonts/Audiowide-Regular.ttf'),
    'Montserrat': require('../../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/limeUniteLogo.jpg')}
        style={styles.image}
        resizeMode="contain"
        
      />
      <Text style={styles.title}>Welcome to Unite</Text>
      <Text style={styles.description}>
        By using Unite Wallet, you agree to the{'\n'}
        <Text style={{ color: '#007bff' }}>terms</Text> and{' '}
        <Text style={{ color: '#007bff' }}>privacy policy</Text>
      </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.push('MainApp', { screen: 'Unite' })}>
        <LinearGradient
          colors={['#D0FF0060', '#D0FF00']}
          style={styles.gradientButton}
        >
          <Text style={styles.primaryText}>Create new wallet</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.push('MainApp', { screen: 'Unite' })}>
        <Text style={styles.secondaryText}>I already have a wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  image: { width: 250, height: 250, marginBottom: 40 },
  title: { color: '#fff', fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 10, fontFamily: 'Audiowide' },
  description: { color: '#aaa', textAlign: 'center', fontSize: 11, marginBottom: 30, fontFamily: 'Montserrat' },
  primaryButton: {
    borderWidth : 1,
    borderBottomWidth : 0,
    borderColor : '#D0FF0090',
    borderRadius : 25,
    marginBottom: 16,
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
    primaryText: { color: '#fff', fontSize: 16,  fontFamily: 'Montserrat-Bold', textTransform: 'uppercase' },
  secondaryText: { color: '#ffffff80', fontSize: 16, fontFamily: 'Montserrat' },
});
