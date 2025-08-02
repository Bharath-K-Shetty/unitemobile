import { RootStackParamList } from '@/types/navigation';
import { getAnchorPrograms } from '@/utils/getAnchorProgram'; // make sure this exports `program`
import CircularLoader from '@components/CircularLoader';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Connection } from '@solana/web3.js';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'; // fallback image
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

const EventScreen = () => {
  const [events, setEvents] = useState<any[]>([]);
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetails'>;
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const connection = new Connection('https://api.devnet.solana.com'); // or use your cluster endpoint
        const { program } = await getAnchorPrograms(connection);
        const allEvents = await program.account.eventAccount.all();
        setEvents(allEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);
  const filteredEvents = events.filter(event =>
    event.account.title.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <View style={{ flex: 1, paddingTop: StatusBar.currentHeight || 24, backgroundColor: '#0d0d0d' }}>
      <ScrollView style={styles.container}>
        <LinearGradient colors={['#D0FF00', '#101400']} style={styles.gradient}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#888" style={{ marginLeft: 8 }} />
            <TextInput
              placeholder="Search for Events"
              placeholderTextColor="#888"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>
        </LinearGradient>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn}><Text style={styles.filterText}>Filters</Text></TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}><Text style={styles.filterText}>Today</Text></TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}><Text style={styles.filterText}>Tomorrow</Text></TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}><Text style={styles.filterText}>This Weekend</Text></TouchableOpacity>
        </View>
        {!loading ?
          (
            filteredEvents.map((event, idx) => (
              <TouchableOpacity key={event.publicKey.toBase58()} style={styles.eventCard}
                onPress={() =>
                  navigation.navigate('EventDetails', {
                    eventPubKey: event.publicKey.toBase58(),
                    imageUrl: require('../../assets/images/event2.jpg'),
                    title: event.account.title,
                    organizer: event.account.organizer.toString(),
                    description: event.account.description,
                    price: event.account.ticketPrice.toString(),
                  })
                }>
                <Image source={require('../../assets/images/event2.jpg')} style={styles.eventImage} />
                <View style={styles.eventOverlay}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={{ flex: 1, padding: 12 }}
                  >
                    <Text style={styles.eventTitle}>
                      {event.account.title}
                    </Text>
                    <Text style={styles.eventTitle}>
                      {event.account.organizer.toString()}
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))
          ) : <CircularLoader />
        }
      </ScrollView>
    </View >
  );
};

export default EventScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  gradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    alignItems: 'center',
    height: 42,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  artistCard: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  artistImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fff',
  },
  artistName: {
    marginTop: 6,
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    width: 72,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBtn: {
    backgroundColor: '#303b00',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  filterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  eventCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#111',
  },
  eventImage: {
    width: '100%',
    height: CARD_WIDTH * 0.6,
    resizeMode: 'cover',
  },
  eventOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
