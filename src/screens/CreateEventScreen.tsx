// src/screens/CreateEventScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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

  const handleDateChange = (type: 'year' | 'month' | 'day' | 'hour' | 'minute', value: number) => {
    const newDate = new Date(deadline);
    
    switch (type) {
      case 'year':
        newDate.setFullYear(value);
        break;
      case 'month':
        newDate.setMonth(value - 1);
        break;
      case 'day':
        newDate.setDate(value);
        break;
      case 'hour':
        newDate.setHours(value);
        break;
      case 'minute':
        newDate.setMinutes(value);
        break;
    }
    
    setDeadline(newDate);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
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

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          placeholderTextColor="#888"
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
          placeholderTextColor="#888"
          value={minQuorum}
          onChangeText={setMinQuorum}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Maximum Quorum"
          placeholderTextColor="#888"
          value={maxQuorum}
          onChangeText={setMaxQuorum}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Ticket Price (in SOL)"
          placeholderTextColor="#888"
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
            Deadline: {formatDateTime(deadline)}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
          <Text style={styles.submitText}>Create Event</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleDateCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleDateCancel}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Deadline</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.modalButton, styles.confirmButton]}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.pickerRow}>
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Year</Text>
                      <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <TouchableOpacity
                            key={year}
                            style={[styles.pickerItem, deadline.getFullYear() === year && styles.pickerItemSelected]}
                            onPress={() => handleDateChange('year', year)}
                          >
                            <Text style={[styles.pickerItemText, deadline.getFullYear() === year && styles.pickerItemTextSelected]}>
                              {year}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Month</Text>
                      <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                          <TouchableOpacity
                            key={month}
                            style={[styles.pickerItem, deadline.getMonth() === index && styles.pickerItemSelected]}
                            onPress={() => handleDateChange('month', index + 1)}
                          >
                            <Text style={[styles.pickerItemText, deadline.getMonth() === index && styles.pickerItemTextSelected]}>
                              {month}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Day</Text>
                      <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <TouchableOpacity
                            key={day}
                            style={[styles.pickerItem, deadline.getDate() === day && styles.pickerItemSelected]}
                            onPress={() => handleDateChange('day', day)}
                          >
                            <Text style={[styles.pickerItemText, deadline.getDate() === day && styles.pickerItemTextSelected]}>
                              {day}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Hour</Text>
                      <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <TouchableOpacity
                            key={hour}
                            style={[styles.pickerItem, deadline.getHours() === hour && styles.pickerItemSelected]}
                            onPress={() => handleDateChange('hour', hour)}
                          >
                            <Text style={[styles.pickerItemText, deadline.getHours() === hour && styles.pickerItemTextSelected]}>
                              {hour.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerLabel}>Min</Text>
                      <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                        {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                          <TouchableOpacity
                            key={minute}
                            style={[styles.pickerItem, deadline.getMinutes() === minute && styles.pickerItemSelected]}
                            onPress={() => handleDateChange('minute', minute)}
                          >
                            <Text style={[styles.pickerItemText, deadline.getMinutes() === minute && styles.pickerItemTextSelected]}>
                              {minute.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
      )}
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

  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },

  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  modalButton: {
    color: '#888',
    fontSize: 16,
  },

  confirmButton: {
    color: '#D0FF00',
    fontWeight: '600',
  },

  datePickerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerColumn: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pickerLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  pickerScroll: {
    height: 150,
    width: 60,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: '#D0FF00',
  },
  pickerItemText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
});
