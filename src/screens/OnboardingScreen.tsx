import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';


type NavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/unitelog.jpg')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to Unite</Text>
      <Text style={styles.description}>
        By using Unite Wallet, you agree to the{' '}
        <Text style={{ color: '#007bff' }}>terms</Text> and{' '}
        <Text style={{ color: '#007bff' }}>privacy policy</Text>
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('MainApp')}>
        <Text style={styles.primaryText}>Create new wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('MainApp')}>
        <Text style={styles.secondaryText}>I already have a wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  image: { width: 250, height: 250, marginBottom: 40 },
  title: { color: '#fff', fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  description: { color: '#aaa', textAlign: 'center', marginBottom: 30 },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 16,
  },
  primaryText: { color: '#000', fontSize: 16, fontWeight: '500' },
  secondaryText: { color: '#fff', fontSize: 16 },
});
