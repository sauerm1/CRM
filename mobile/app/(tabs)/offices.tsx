import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../../services/api';
import type { Office } from '../../types';

export default function OfficesScreen() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingOffice, setBookingOffice] = useState<Office | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOffices = async () => {
    try {
      const data = await apiService.getOffices();
      setOffices(data);
    } catch (error) {
      console.error('Failed to load offices:', error);
      Alert.alert('Error', 'Failed to load offices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOffices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadOffices();
  };

  const handleBookOffice = (office: Office) => {
    setBookingOffice(office);
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 60 * 60 * 1000));
    setNotes('');
  };

  const submitBooking = async () => {
    if (!bookingOffice?.id) return;

    if (endDate <= startDate) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createOfficeBooking({
        office_id: bookingOffice.id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        notes,
      });
      Alert.alert('Success', 'Office booked successfully!');
      setBookingOffice(null);
      loadOffices();
    } catch (error: any) {
      console.error('Error booking office:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to book office');
    } finally {
      setSubmitting(false);
    }
  };

  const renderOffice = ({ item }: { item: Office }) => (
    <View style={styles.officeCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.officeName}>{item.name}</Text>
        <View style={[styles.typeBadge, getTypeBadgeStyle(item.type)]}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.details}>
        {item.capacity && <Text style={styles.detailText}>👥 Capacity: {item.capacity}</Text>}
        {item.hourly_rate && <Text style={styles.detailText}>💰 ${item.hourly_rate}/hour</Text>}
        {item.daily_rate && <Text style={styles.detailText}>💵 ${item.daily_rate}/day</Text>}
      </View>

      {item.amenities && item.amenities.length > 0 && (
        <View style={styles.amenities}>
          {item.amenities.map((amenity, index) => (
            <View key={index} style={styles.amenityBadge}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => handleBookOffice(item)}
        disabled={!item.active}
      >
        <Text style={styles.bookButtonText}>
          {item.active ? 'Book Office' : 'Unavailable'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getTypeBadgeStyle = (type: string) => {
    const styles = {
      private: { backgroundColor: '#e0e7ff' },
      shared: { backgroundColor: '#fef3c7' },
      meeting_room: { backgroundColor: '#dbeafe' },
      phone_booth: { backgroundColor: '#f3e8ff' },
    };
    return styles[type as keyof typeof styles] || { backgroundColor: '#f3f4f6' };
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={offices}
        renderItem={renderOffice}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No offices available</Text>
        }
      />

      {/* Booking Modal */}
      <Modal
        visible={bookingOffice !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setBookingOffice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book {bookingOffice?.name}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text>{startDate.toLocaleString()}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="datetime"
                  onChange={(event, date) => {
                    setShowStartPicker(false);
                    if (date) setStartDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text>{endDate.toLocaleString()}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="datetime"
                  onChange={(event, date) => {
                    setShowEndPicker(false);
                    if (date) setEndDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special requirements..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setBookingOffice(null)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitBooking}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Book</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  officeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  officeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  details: {
    gap: 6,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  amenityBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 11,
    color: '#22c55e',
  },
  bookButton: {
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#22c55e',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
