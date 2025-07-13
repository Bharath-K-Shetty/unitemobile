// src/screens/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewToken
} from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/RootNavigator';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 0.4;
// dummy data
const EVENTS = [
  {
    id: 1,
    title: 'Echoes of Earth, 2025',
    date: '06 Dec - 07 Dec, 1 PM',
    location: 'Bengaluru',
    image: require('../../assets/images/event1.jpg'),
  },
  {
    id: 2,
    title: 'Echoes of Earth, 2025',
    date: '06 Dec - 07 Dec, 1 PM',
    location: 'Bengaluru',
    image: require('../../assets/images/event1.jpg'),
  },
  {
    id: 3,
    title: 'Echoes of Earth, 2025',
    date: '06 Dec - 07 Dec, 1 PM',
    location: 'Bengaluru',
    image: require('../../assets/images/event1.jpg'),
  },
  {
    id: 4,
    title: 'Echoes of Earth, 2025',
    date: '06 Dec - 07 Dec, 1 PM',
    location: 'Bengaluru',
    image: require('../../assets/images/event1.jpg'),
  },
  {
    id: 5,
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedValues = useRef(EVENTS.map(() => new Animated.Value(0.85))).current;
  const opacityValues = useRef(EVENTS.map(() => new Animated.Value(0.5))).current;

  const animateCard = (index: number, isActive: boolean) => {
    const scale = isActive ? 1 : 0.92;
    const opacity = isActive ? 1 : 0.6;
    
    Animated.parallel([
      Animated.timing(animatedValues[index], {
        toValue: scale,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValues[index], {
        toValue: opacity,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Initialize first card as active on mount
  useEffect(() => {
    EVENTS.forEach((_, index) => {
      animateCard(index, index === 0);
    });
  }, []);

  const renderEvent = ({ item, index }: any) => (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          opacity: opacityValues[index],
          transform: [{ scale: animatedValues[index] }],
        },
      ]}
    >
      <TouchableOpacity style={{ flex: 1 }}>
        <Image source={item.image} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardDate, { color: theme.colors.text }]}>{item.date}</Text>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.cardLoc, { color: theme.colors.text }]}>{item.location}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100
  }).current;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken<any>[]; changed: ViewToken<any>[]; }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      
      if (newIndex !== null && newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        
        // Animate all cards
        EVENTS.forEach((_, index) => {
          animateCard(index, index === newIndex);
        });
      }
    }
  }, [currentIndex]);

  const onScroll = useCallback((event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (CARD_WIDTH + CARD_SPACING));
    
    if (index >= 0 && index < EVENTS.length && index !== currentIndex) {
      setCurrentIndex(index);
      
      // Animate all cards
      EVENTS.forEach((_, cardIndex) => {
        animateCard(cardIndex, cardIndex === index);
      });
    }
  }, [currentIndex]);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged }
  ]);

  return (
    <View style={{ flex: 1, paddingTop: StatusBar.currentHeight, backgroundColor: '#0d0d0d' }}>
      {/* purple gradient header + search */}
      <LinearGradient
        colors={['#D0FF00', '#101400']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={[styles.walletId, { color: "#000" }]}>
            bharathshettyy.cb.id
          </Text>
          <View style={styles.headerRight}>
            <Ionicons name="qr-code-outline" size={24} color="#000" />
            <Ionicons name="settings-outline" size={24} color="#000" style={{ marginLeft: 16 }} />
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
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => navigation.navigate("MainApp", { screen: "Events" })} >
          <LinearGradient
            colors={['#D0FF00', '#404e00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.primaryButton, styles.extraMargin]}

          >
            <Text >Join Event</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("CreateEvent")}>
          <LinearGradient
            colors={['#D0FF00', '#404e00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}

          >
            <Text >Create Event</Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>In the Spotlight</Text>
      <FlatList
        ref={carouselRef}
        data={EVENTS}
        renderItem={renderEvent}
        keyExtractor={i => i.id.toString()}
        horizontal
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        initialScrollIndex={0}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + CARD_SPACING,
          offset: (CARD_WIDTH + CARD_SPACING) * index,
          index,
        })}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
      />
    </View >
  );
}

const CARD_SPACING = 16;

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: {
    paddingTop: 15,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#d0ff00',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 16,
  },
  extraMargin: {
    marginRight: 20
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,

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
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    paddingTop: 8,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 12,
    overflow: 'hidden',
    height: CARD_WIDTH * 1.3
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 1,
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
