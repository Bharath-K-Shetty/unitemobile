// src/screens/ProfileScreen.tsx
import { initOrganizer } from '@/lib/getUniteProgram';
import { useAuthorization } from '@/utils/useAuthorization';
import { useMobileWallet } from '@/utils/useMobileWallet';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Connection } from '@solana/web3.js';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const ProfileScreen = () => {
  const publicKey = SecureStore.getItem("wallet_address");
  const wallet = useMobileWallet();
  const navigation = useNavigation();
  const { authorizeSession } = useAuthorization();

  // const handleInitialize = async () => {
  //   try {
  //     const publicKeyStr = await SecureStore.getItemAsync("wallet_address");
  //     if (!publicKeyStr) {
  //       console.warn("No wallet address found in SecureStore.");
  //       return;
  //     }

  //     const connection = new Connection("https://api.devnet.solana.com", "confirmed");


  //     const publicKey = new PublicKey(publicKeyStr);
  //     const destination = new PublicKey("8MPs4Am9W8vMfpqnYB96MKHGC6yy83Eq1d4Rc455bVFL");

  //     const {
  //       context: { slot: minContextSlot },
  //       value: latestBlockhash,
  //     } = await connection.getLatestBlockhashAndContext();

  //     const instructions = [
  //       SystemProgram.transfer({
  //         fromPubkey: publicKey,
  //         toPubkey: destination,
  //         lamports: 0.001 * LAMPORTS_PER_SOL,
  //       }),
  //     ];

  //     const message = new TransactionMessage({
  //       payerKey: publicKey,
  //       recentBlockhash: latestBlockhash.blockhash,
  //       instructions,
  //     }).compileToLegacyMessage();

  //     const transaction = new VersionedTransaction(message);

  //     // ✅ No serialization. Use direct signAndSendTransaction
  //     const signature = await wallet.signAndSendTransaction(transaction, minContextSlot);

  //     // ✅ Confirm transaction
  //     await connection.confirmTransaction(
  //       {
  //         signature,
  //         ...latestBlockhash,
  //       },
  //       "confirmed"
  //     );

  //     console.log("✅ Signature:", signature);

  //   } catch (e) {
  //     console.error("❌ Transaction failed:", e);
  //   }
  // };
  const handleInitialize = async () => {
    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      await initOrganizer(connection, wallet);
      alert("✅ Organizer verified successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`❌ Error verifying organizer: ${err.message}`);
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
            <View style={{ marginLeft: 12, width: 200 }}>
              <Text style={styles.profileName}>  {publicKey ? ` ${publicKey}` : 'Not connected'}</Text>
              <Text style={styles.profilePhone}>+91 7795116048</Text>
            </View>
            <TouchableOpacity style={{ marginLeft: 'auto' }}>
              <Ionicons name="pencil-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>




        <TouchableOpacity style={styles.initilizeButton}
          onPress={handleInitialize}
        >
          <Text style={styles.initilizeText}>Verify as a Organizer</Text>
        </TouchableOpacity>


      </ScrollView>
    </View>
  );
};


const BookingCard = ({ icon, label }: { icon: string; label: string }) => (
  <TouchableOpacity style={styles.bookingCard}>
    <MaterialCommunityIcons name={icon as any} size={22} color="#ccc" />
    <Text style={styles.bookingText}>{label}</Text>
  </TouchableOpacity>
);

const ListItem = ({ icon, label }: { icon: string; label: string }) => (
  <TouchableOpacity style={styles.listItem}>
    <MaterialCommunityIcons name={icon as any} size={22} color="#fff" />
    <Text style={styles.listLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#999" style={{ marginLeft: 'auto' }} />
  </TouchableOpacity>
);

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
});
