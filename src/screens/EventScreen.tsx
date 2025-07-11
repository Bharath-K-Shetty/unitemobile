// src/screens/EventScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

const ARTISTS = [
  { id: '1', name: 'A. R. Rahman', image: require('../../assets/images/event1.jpg') },
  { id: '2', name: 'Enrique Iglesias', image: require('../../assets/images/event1.jpg') },
  { id: '3', name: 'Hiphop Tamizha Adhi', image: require('../../assets/images/event1.jpg') },
];

const EVENTS = [
  {
    id: '1',
    title: 'Bandaje Falls Trek',
    image: require('../../assets/images/unitelog.jpg'),
  },
];

const EventScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <LinearGradient colors={['#4e2ca5', '#2a0c4d']} style={styles.gradient}>
          {/* Search bar */}
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#888" style={{ marginLeft: 8 }} />
            <TextInput
              placeholder="Search for ‘A. R. Rahman’"
              placeholderTextColor="#888"
              style={styles.searchInput}
            />
          </View>

          <Text style={styles.title}>Artists In Your District</Text>
          <FlatList
            horizontal
            data={ARTISTS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            renderItem={({ item }) => (
              <View style={styles.artistCard}>
                <Image source={item.image} style={styles.artistImage} />
                <Text style={styles.artistName}>{item.name}</Text>
              </View>
            )}
          />
        </LinearGradient>
      </SafeAreaView>
      {/* Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Tomorrow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>This Weekend</Text>
        </TouchableOpacity>
      </View>

      {/* Events */}
      {EVENTS.map((event) => (
        <TouchableOpacity key={event.id} style={styles.eventCard}>
          <Image source={event.image} style={styles.eventImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.eventOverlay}
          >
            <Text style={styles.eventTitle}>{event.title}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
    backgroundColor: '#2a0c4d',
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
