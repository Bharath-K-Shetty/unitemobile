// src/screens/CreateEventScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


export default function CreateEventScreen() {
  const [eventName, setEventName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [minQuorum, setMinQuorum] = useState('');
  const [maxQuorum, setMaxQuorum] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || deadline;
    setShowDatePicker(Platform.OS === 'ios');
    setDeadline(currentDate);
  };

  const handleCreate = () => {
    // TODO: Submit logic here
    console.log({
      eventName,
      image,
      minQuorum,
      maxQuorum,
      ticketPrice,
      deadline,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#D0FF00', '#101400']} style={styles.gradient}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create New Event</Text>
      </LinearGradient>

      <View style={styles.form}>
        <TextInput
          placeholder="Event Name"
          value={eventName}
          onChangeText={setEventName}
          style={styles.input}
        />

        <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imageUploadText}>Upload Event Image</Text>
          )}
        </TouchableOpacity>

        <TextInput
          placeholder="Minimum Quorum"
          value={minQuorum}
          onChangeText={setMinQuorum}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Maximum Quorum"
          value={maxQuorum}
          onChangeText={setMaxQuorum}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Ticket Price (in SOL)"
          value={ticketPrice}
          onChangeText={setTicketPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Text style={styles.datePickerText}>
            {`Deadline: ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString()}`}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="datetime"
            display="default"
            onChange={onChangeDate}
          />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
          <Text style={styles.submitText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },

  gradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },

  form: {
    flex: 1,
    padding: 20,
    gap: 16,
  },

  input: {
    backgroundColor: '#222',
    color: '#ffffff',
    padding: 12,
    borderRadius: 10,
  },

  imageUpload: {
    backgroundColor: '#222',
    borderRadius: 10,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageUploadText: {
    color: '#888',
  },

  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },

  datePickerButton: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 10,
  },

  datePickerText: {
    color: '#fff',
  },

  submitButton: {
    backgroundColor: '#D0FF00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  submitText: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  }, backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
});
