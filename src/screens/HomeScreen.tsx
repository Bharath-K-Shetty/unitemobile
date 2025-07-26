import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useMobileWallet } from '@/utils/useMobileWallet';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
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
const CARD_SPACING = 16;

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
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { isDark, toggleTheme, theme } = useThemeContext();
  const carouselRef = useRef<FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedValues = useRef(EVENTS.map(() => new Animated.Value(0.85))).current;
  const opacityValues = useRef(EVENTS.map(() => new Animated.Value(0.5))).current;
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { disconnect } = useMobileWallet();
  const getWalletaddress = async () => {
    let wallet = await SecureStore.getItemAsync("wallet_address");
    if (wallet) {
      setWalletAddress(wallet);
    }
  };
  useEffect(() => {
    getWalletaddress();
  }, []);

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

  const scrollToIndex = (index: number) => {
    if (carouselRef.current && !isScrollingRef.current) {
      isScrollingRef.current = true;
      carouselRef.current.scrollToIndex({
        index,
        animated: true,
      });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  };

  const startAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }

    autoScrollInterval.current = setInterval(() => {
      if (!isUserScrolling && !isScrollingRef.current) {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % EVENTS.length;
          scrollToIndex(nextIndex);

          EVENTS.forEach((_, index) => {
            animateCard(index, index === nextIndex);
          });

          return nextIndex;
        });
      }
    }, 3000);
  }, [isUserScrolling]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }, []);

  const handleScrollBegin = useCallback(() => {
    setIsUserScrolling(true);
    stopAutoScroll();

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
  }, [stopAutoScroll]);

  const handleScrollEnd = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsUserScrolling(false);
      setTimeout(() => {
        startAutoScroll();
      }, 100);
    }, 2000);
  }, [startAutoScroll]);

  useEffect(() => {
    EVENTS.forEach((_, index) => {
      animateCard(index, index === 0);
    });

    const initTimeout = setTimeout(() => {
      startAutoScroll();
    }, 1000);

    return () => {
      clearTimeout(initTimeout);
      stopAutoScroll();
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [startAutoScroll, stopAutoScroll]);

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
    if (viewableItems.length > 0 && !isScrollingRef.current) {
      const newIndex = viewableItems[0].index;

      if (newIndex !== null && newIndex !== currentIndex) {
        setCurrentIndex(newIndex);

        EVENTS.forEach((_, index) => {
          animateCard(index, index === newIndex);
        });
      }
    }
  }, [currentIndex]);

  const onScroll = useCallback((event: any) => {
    if (isScrollingRef.current) return;

    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (CARD_WIDTH + CARD_SPACING));

    if (index >= 0 && index < EVENTS.length && index !== currentIndex) {
      setCurrentIndex(index);

      EVENTS.forEach((_, cardIndex) => {
        animateCard(cardIndex, cardIndex === index);
      });
    }
  }, [currentIndex]);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged }
  ]);

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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: StatusBar.currentHeight, backgroundColor: '#0d0d0d' }}>
        <LinearGradient
          colors={['#D0FF00', '#101400']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Ionicons name="person-circle-outline" size={28} onPress={() => navigation.navigate("ProfileScreen")} />
            <View style={styles.headerRight}>
              <Ionicons name="qr-code-outline" size={24} color="#000" />
              <Ionicons name="settings-outline" size={24} color="#000" style={{ marginLeft: 16, }} />
              <Switch value={isDark} onValueChange={toggleTheme} thumbColor="#fff" style={{ marginLeft: 16, marginRight: 16 }} />
              <Ionicons
                name="log-out-outline"
                size={28}
                color="white"
                onPress={handleLogout}
                style={{ alignSelf: 'flex-end' }}
              />
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
              style={[styles.primaryButton, styles.extraMargin]}
            >
              <Text style={styles.buttonText}>Join Event</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("CreateEvent")}>
            <LinearGradient
              colors={['#D0FF00', '#404e00']}
              style={styles.primaryButton}
            >
              <Text style={styles.buttonText}>Create Event</Text>
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
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: {
    paddingTop: 15,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#D0FF00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
