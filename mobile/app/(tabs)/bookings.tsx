import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import type { ClassBooking, Reservation, OfficeBooking } from '../../types';

export default function BookingsScreen() {
  const [classBookings, setClassBookings] = useState<ClassBooking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [officeBookings, setOfficeBookings] = useState<OfficeBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    try {
      const [classes, rest, offices] = await Promise.all([
        apiService.getClassBookings(),
        apiService.getReservations(),
        apiService.getOfficeBookings(),
      ]);
      setClassBookings(classes);
      setReservations(rest);
      setOfficeBookings(offices);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      Alert.alert('Error', 'Failed to load your bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelClassBooking = async (id: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this class booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelClassBooking(id);
              Alert.alert('Success', 'Booking cancelled');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const handleCancelReservation = async (id: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelReservation(id);
              Alert.alert('Success', 'Reservation cancelled');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const handleCancelOfficeBooking = async (id: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this office booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelOfficeBooking(id);
              Alert.alert('Success', 'Booking cancelled');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const renderClassBooking = (item: ClassBooking) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="fitness" size={24} color="#22c55e" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Class Booking</Text>
          <Text style={styles.date}>{new Date(item.booked_at || '').toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      {item.notes && <Text style={styles.notes}>Notes: {item.notes}</Text>}
      {item.status !== 'cancelled' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelClassBooking(item.id!)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderReservation = (item: Reservation) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="restaurant" size={24} color="#f59e0b" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Restaurant Reservation</Text>
          <Text style={styles.date}>{new Date(item.date_time).toLocaleString()}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.details}>Party Size: {item.party_size}</Text>
      {item.special_requests && <Text style={styles.notes}>Notes: {item.special_requests}</Text>}
      {item.status !== 'cancelled' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelReservation(item.id!)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderOfficeBooking = (item: OfficeBooking) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="briefcase" size={24} color="#3b82f6" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Office Booking</Text>
          <Text style={styles.date}>
            {new Date(item.start_time).toLocaleString()} - {new Date(item.end_time).toLocaleTimeString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      {item.total_cost && <Text style={styles.details}>Cost: ${item.total_cost}</Text>}
      {item.notes && <Text style={styles.notes}>Notes: {item.notes}</Text>}
      {item.status !== 'cancelled' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelOfficeBooking(item.id!)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: '#d1fae5' };
      case 'cancelled':
        return { backgroundColor: '#fee2e2' };
      case 'completed':
        return { backgroundColor: '#e0e7ff' };
      case 'waitlist':
        return { backgroundColor: '#fef3c7' };
      default:
        return { backgroundColor: '#f3f4f6' };
    }
  };

  const sections = [
    { title: 'Class Bookings', data: classBookings, renderItem: renderClassBooking },
    { title: 'Restaurant Reservations', data: reservations, renderItem: renderReservation },
    { title: 'Office Bookings', data: officeBookings, renderItem: renderOfficeBooking },
  ].filter(section => section.data.length > 0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        renderItem={({ item, section }) => section.renderItem(item)}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>Start booking classes, restaurants, and offices!</Text>
          </View>
        }
      />
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  notes: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
});
