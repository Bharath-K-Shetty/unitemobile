// src/screens/ProfileScreen.tsx
import { checkIfOrganizerIsVerified, deverifyOrganizer, getEventsByOrganizer, getTicketsWithEventNames, initOrganizer, verifyOrganizer } from '@/lib/getUniteProgram';
import { RootStackParamList } from '@/navigation/RootNavigator';

import { useAuthorization } from '@/utils/useAuthorization';
import { useMobileWallet } from '@/utils/useMobileWallet';
import CircularLoader from '@components/CircularLoader';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Connection } from '@solana/web3.js';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;
const ProfileScreen = () => {
  const publicKey = SecureStore.getItem("wallet_address");
  const wallet = useMobileWallet();
  const navigation = useNavigation<HomeNavProp>();
  const { authorizeSession } = useAuthorization();
  const { disconnect } = useMobileWallet();
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");


  const MIN_COLLATERAL = 1;

  const [modalVisible, setModalVisible] = useState(false);
  const [collateral, setCollateral] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [organizedEvents, setOrganizedEvents] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {

    (async () => {

      if (publicKey) {
        const verified = await checkIfOrganizerIsVerified(connection, wallet);
        setIsVerified(verified as boolean);
        setLoading(true);
        // Fetch organizer events
        try {
          const events = await getEventsByOrganizer(connection, wallet);
          setOrganizedEvents(events);
        } catch (e) {
          console.warn("No events found or error fetching events", e);
        }

        // Fetch tickets bought
        try {
          const tickets = await getTicketsWithEventNames(connection, wallet);
          setMyTickets(tickets);

        } catch (e) {
          console.warn("No tickets found or error fetching tickets", e);
        }
        setLoading(false);
      }
    })();
  }, [wallet]);


  useEffect(() => {
    (async () => {
      if (publicKey) {
        const verified = await checkIfOrganizerIsVerified(connection, wallet);
        setIsVerified(verified as boolean);
      }
    })();
  }, [wallet]);
  const handleInitialize = async () => {
    try {
      await initOrganizer(connection, wallet);
      alert("✅ Organizer verified successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`❌ Error verifying organizer: ${err.message}`);
    }
  };
  const handleDeverify = async () => {
    try {
      await deverifyOrganizer(connection, wallet);
      alert("✅ Organizer Deverified successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`❌ Error verifying organizer: ${err.message}`);
    }
  }

  const handleLogout = async () => {
    await disconnect();
    await SecureStore.deleteItemAsync('unite_auth_token');
    await SecureStore.deleteItemAsync('wallet_address');
    console.log('🚪 Logged out: Tokens cleared');

    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  };
  const handleVerifyPress = async () => {
    if (isVerified) {
      alert("You're already verified!");
      return;
    }

    const amount = parseFloat(collateral);
    if (isNaN(amount) || amount < MIN_COLLATERAL) {
      alert(`Collateral must be at least ${MIN_COLLATERAL} SOL`);
      return;
    }
    try {
      await verifyOrganizer(connection, wallet, amount);
      alert("🎉 Verified successfully!");
      setIsVerified(true); // Update UI optimistically
      setModalVisible(false);
    } catch (err: any) {
      alert(`❌ Verification failed: ${err.message}`);
    }
  };


  return (
    <View style={{ flex: 1, paddingTop: StatusBar.currentHeight, backgroundColor: '#0d0d0d' }}>
      <ScrollView style={styles.container}>
        <LinearGradient colors={['#D0FF00', '#101400']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity>
              <Ionicons name="arrow-back" size={24} color="#fff" onPress={() => navigation.goBack()} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Profile</Text>
          </View>

          <View style={styles.profileInfo}>
            <Image
              source={require('../../assets/images/limeUniteLogo.jpg')}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">
                {publicKey ? `${publicKey}` : 'Not connected'}
              </Text>
              {isVerified ? (
                <Image
                  source={require('../../assets/verify.png')}
                  style={{ width: 20, height: 20, marginLeft: 8 }}
                />
              ) : (
                <TouchableOpacity onPress={() => setModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                  <Text style={{ color: '#D0FF00' }}> Get Verified </Text>
                  <Image source={require('../../assets/verify.png')} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
              )}
            </View>


            <TouchableOpacity style={{ marginLeft: 'auto' }}>

              <Ionicons name="pencil-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>



        {!isVerified &&
          <TouchableOpacity style={styles.initilizeButton}
            onPress={handleInitialize}
          >
            <Text style={styles.initilizeText}>Verify as a Organizer</Text>
          </TouchableOpacity>
        }

        {!loading ? (
          <>
            <Text style={styles.sectionTitle}>My Events</Text>
            {organizedEvents.length === 0 ? (
              <Text style={{ color: '#ccc', textAlign: 'center' }}>No events created.</Text>
            ) : (
              organizedEvents.map((event, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listLabel}>{event.title}</Text>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>Tickets Bought</Text>
            {myTickets.length === 0 ? (
              <Text>No tickets bought.</Text>
            ) : (
              myTickets.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listLabel}>🎟 {item.eventName}</Text>
                  <Text style={styles.listDetail}>🕒 {new Date(item.ticket.timestamp * 1000).toLocaleString()}</Text>
                </View>
              ))
            )}
          </>
        ) : (
          <CircularLoader />
        )}


      </ScrollView>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' }}>
          <View style={{ backgroundColor: '#1a1a1a', padding: 20, borderRadius: 10, width: '80%' }}>
            <Text style={{ color: '#fff', marginBottom: 10 }}>Enter Collateral Amount (min 1 SOL):</Text>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="e.g. 1.5"
              value={collateral}
              onChangeText={setCollateral}
              style={{ backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 6 }}
            />
            <TouchableOpacity onPress={handleVerifyPress} style={{ backgroundColor: '#D0FF00', padding: 12, borderRadius: 6 }}>
              <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Confirm Verification</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: '#ccc', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {isVerified ?
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.deverifyOrganiser}
            onPress={handleDeverify}
          >
            <Text style={styles.initilizeText}>DeVerify as a Organizer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutVerified}
            onPress={handleLogout}
          >
            <Text style={styles.initilizeText}>Logout</Text>
          </TouchableOpacity>
        </View>
        : <TouchableOpacity style={styles.logoutDeVerified}
          onPress={handleLogout}
        >
          <Text style={styles.initilizeText}>Logout</Text>
        </TouchableOpacity>
      }


    </View >

  );
};


export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  gradient: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  initilizeButton: {
    backgroundColor: '#D0FF00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    marginEnd: 20,
    marginStart: 20
  },
  initilizeText: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  },
  deverifyOrganiser: {
    backgroundColor: '#FF7559',
    width: 185,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    marginEnd: 20,
    marginStart: 10

  },
  logoutVerified: {
    backgroundColor: '#FF7F7F',
    width: 185,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutDeVerified: {
    backgroundColor: '#FF7F7F',
    width: 360,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    margin: 25,
  },
  bottomButtons: {
    flexDirection: 'row',
    marginBottom: 30
  },
  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
  },
  profileName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  profilePhone: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  bookingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  bookingCard: {
    width: '30%',
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  listLabel: {
    marginLeft: 12,
    color: '#fff',
    fontSize: 15,
  },
  listDetail: {
    marginLeft: 12,
    color: '#fff',
    fontSize: 15,
  },

});
