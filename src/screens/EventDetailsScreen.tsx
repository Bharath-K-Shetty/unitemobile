import { buyTicket, getTicketPDA, ticketVaultInitialization } from '@/lib/getUniteProgram';
import { useMobileWallet } from '@/utils/useMobileWallet';
import { Ionicons } from '@expo/vector-icons'; // Or any icon library you prefer
import { useNavigation } from '@react-navigation/native';
import { Connection, PublicKey } from '@solana/web3.js';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const EventDetailsScreen = ({ route }: any) => {
  const {
    eventPubKey,
    imageUrl,
    title,
    organizer,
    description,
    price,
  } = route.params;

  const navigation = useNavigation();
  const wallet = useMobileWallet()
  const [isVaultInitialized, setIsVaultInitialized] = useState(false);
  const [timestamp, setTimeStamp] = useState(0);

  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds
    setTimeStamp(now);
  }, []);
  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync("wallet_address");
      if (stored) {
        setPublicKey(new PublicKey(stored));
      }
    })();
  }, []);

  useEffect(() => {
    if (!publicKey || !timestamp) return;

    const checkVault = async () => {
      try {

        const [vaultPDA] = getTicketPDA(new PublicKey(eventPubKey), publicKey, timestamp);
        const acc = await connection.getAccountInfo(vaultPDA);
        setIsVaultInitialized(!!acc);
      } catch (err) {
        console.error("Failed to check vault init state:", err);
      }
    };

    checkVault();
  }, [publicKey, timestamp]);

  const handleBuyTicket = async () => {
    try {
      if (!wallet) {
        alert('Wallet not connected');
        return;
      }

      const sig = await buyTicket(connection, wallet, new PublicKey(eventPubKey), timestamp);
      alert('Success' + `Ticket purchased!\nTxn: ${sig}`);

    } catch (err: any) {
      console.error('❌ Ticket purchase failed:', err);
      alert(err.message);
    }
  };
  const handleInitializeTicketVault = async () => {
    try {
      if (!wallet) {
        alert('Wallet not connected');
        return;
      }
      const sig = await ticketVaultInitialization(connection, wallet, new PublicKey(eventPubKey), timestamp);
      alert('Success' + `Ticket purchased!\nTxn: ${sig}`);
      setIsVaultInitialized(true);
    } catch (err: any) {
      console.error('❌ Ticket purchase failed:', err);
      alert(err.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.headerWrapper}>
          <Image source={imageUrl} style={styles.bannerImage} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.metaText}>{eventPubKey}</Text>
          <Text style={styles.metaText}>Organized by {organizer}</Text>
          <Text style={styles.metaText}>🎟 Starts from ₹{price}</Text>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{description}</Text>

          <TouchableOpacity style={styles.bookBtn} onPress={handleBuyTicket}>
            <Text style={styles.bookBtnText}>Book tickets</Text>
          </TouchableOpacity>
          {!isVaultInitialized &&
            <TouchableOpacity style={styles.initializeVault} onPress={handleInitializeTicketVault}>
              <Text style={styles.bookBtnText}>Initilize Vault</Text>
            </TouchableOpacity>}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventDetailsScreen;


const styles = StyleSheet.create({
  headerWrapper: {
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 50,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  metaText: {
    color: '#aaa',
    marginBottom: 4,
    fontSize: 14,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    color: '#ccc',
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  bookBtn: {
    marginTop: 32,
    backgroundColor: '#D0FF00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  initializeVault: {
    marginTop: 32,
    backgroundColor: '#FF0000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});