// src/screens/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { TabParamList } from '../navigation';

type HomeNavProp = BottomTabNavigationProp<TabParamList, 'Unite'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 0.4;
// dummy data
const EVENTS = [
  {
    id: '1',
    title: 'Echoes of Earth, 2025',
    date: '06 Dec - 07 Dec, 1 PM',
    location: 'Bengaluru',
    image: require('../../assets/images/event1.jpg'),
  },
  {
    id: '2',
    title: 'Echoes of Earth, 2025',
    date: '06 Dec - 07 Dec, 1 PM',
    location: 'Bengaluru',
    image: require('../../assets/images/event1.jpg'),
  },
  {
    id: '3',
    title: 'Echoes of Earth, 2025',
    date: '06 Dec - 07 Dec, 1 PM',
    location: 'Bengaluru',
    image: require('../../assets/images/event1.jpg'),
  },
  {
    id: '4',
    title: 'Echoes of Earth, 2025',
    date: '06 Dec - 07 Dec, 1 PM',
    location: 'Bengaluru',
    image: require('../../assets/images/event1.jpg'),
  },
  {
    id: '5',
    title: 'Echoes of Earth, 2025',
    date: '06 Dec - 07 Dec, 1 PM',
    location: 'Bengaluru',
    image: require('../../assets/images/event1.jpg'),
  },
  // add more...
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { isDark, toggleTheme, theme } = useThemeContext();
  const carouselRef = useRef<FlatList<any>>(null);

  const renderEvent = ({ item }: any) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardDate, { color: theme.colors.text }]}>{item.date}</Text>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[styles.cardLoc, { color: theme.colors.text }]}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* purple gradient header + search */}
      <LinearGradient
        colors={['#4e2ca5', '#2a0c4d']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={[styles.walletId, { color: theme.colors.text }]}>
            bharathshettyy.cb.id
          </Text>
          <View style={styles.headerRight}>
            <Ionicons name="qr-code-outline" size={24} color={theme.colors.text} />
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} style={{ marginLeft: 16 }} />
            <Switch value={isDark} onValueChange={toggleTheme} thumbColor="#fff" />
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={{ marginLeft: 8 }} />
          <TextInput
            placeholder="Search for events..."
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
        </View>
      </LinearGradient>

      {/* carousel */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>In the Spotlight</Text>
      <FlatList
        ref={carouselRef}
        data={EVENTS}
        renderItem={renderEvent}
        keyExtractor={i => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
      />
    </View>
  );
}

const CARD_SPACING = 16;

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletId: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    height: 40,
    alignItems: 'center',
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  carousel: {
    paddingHorizontal: CARD_SPACING / 2,
    paddingTop: 8,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 0.56,
  },
  cardInfo: {
    padding: 12,
  },
  cardDate: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  cardLoc: {
    fontSize: 12,
  },
});
