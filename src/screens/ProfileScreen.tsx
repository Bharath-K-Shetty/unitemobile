// src/screens/ProfileScreen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  return (
    <View style={{ flex: 1, paddingTop: StatusBar.currentHeight, backgroundColor: '#0d0d0d' }}>
      <ScrollView style={styles.container}>
        <LinearGradient colors={['#D0FF00', '#101400']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Profile</Text>
          </View>

          <View style={styles.profileInfo}>
            <Image
              source={require('../../assets/images/limeUniteLogo.jpg')}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.profileName}>Update your name</Text>
              <Text style={styles.profilePhone}>+91 7795116048</Text>
            </View>
            <TouchableOpacity style={{ marginLeft: 'auto' }}>
              <Ionicons name="pencil-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* All Bookings */}
        <SectionTitle title="All bookings" />
        <View style={styles.bookingsRow}>
          <BookingCard icon="silverware-fork-knife" label="Table bookings" />
          <BookingCard icon="movie-open" label="Movie tickets" />
          <BookingCard icon="guitar-electric" label="Event tickets" />
        </View>

        {/* Vouchers */}
        <SectionTitle title="Vouchers" />
        <ListItem icon="gift-outline" label="Collected vouchers" />

        {/* Payments */}
        <SectionTitle title="Payments" />
        <ListItem icon="file-document-outline" label="Dining transactions" />
        <ListItem icon="wallet-outline" label="District Money" />

        {/* Manage */}
        <SectionTitle title="Manage" />
        <ListItem icon="pencil" label="Your reviews" />
        <ListItem icon="flash-outline" label="Hotlists" />
        <ListItem icon="bell-outline" label="Movie reminders" />
      </ScrollView>
    </View>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

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
    fontSize: 16,
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
