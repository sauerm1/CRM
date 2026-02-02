import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ClassesStackParamList } from '../navigation/AppNavigator';
import { classesAPI } from '../api';
import { Class } from '../types';

type ClassDetailScreenProps = {
  navigation: NativeStackNavigationProp<ClassesStackParamList, 'ClassDetail'>;
  route: RouteProp<ClassesStackParamList, 'ClassDetail'>;
};

export default function ClassDetailScreen({ route, navigation }: ClassDetailScreenProps) {
  const { classId } = route.params;
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      const data = await classesAPI.getClass(classId);
      setClassData(data);
    } catch (error) {
      console.error('Error fetching class details:', error);
      Alert.alert('Error', 'Could not load class details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async () => {
    if (!classData) return;

    if (classData.current_enrollment >= classData.max_capacity) {
      Alert.alert('Class Full', 'This class is currently at full capacity');
      return;
    }

    setBooking(true);
    try {
      // TODO: Get actual member ID from auth context
      const memberId = 'current-member-id';
      await classesAPI.bookClass(classId, memberId);
      Alert.alert('Success', 'You have successfully booked this class!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Booking Failed', error.response?.data?.error || 'Could not book class');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.centerContainer}>
        <Text>Class not found</Text>
      </View>
    );
  }

  const isFull = classData.current_enrollment >= classData.max_capacity;
  const availableSpots = classData.max_capacity - classData.current_enrollment;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{classData.name}</Text>
          <View style={[
            styles.statusBadge,
            isFull && styles.statusBadgeFull
          ]}>
            <Text style={styles.statusText}>
              {isFull ? 'FULL' : `${availableSpots} spots left`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{classData.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(classData.start_time).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>
              {new Date(classData.start_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              -{' '}
              {new Date(classData.end_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{classData.location}</Text>
          </View>
          {classData.instructor_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Instructor:</Text>
              <Text style={styles.detailValue}>{classData.instructor_name}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Capacity:</Text>
            <Text style={styles.detailValue}>
              {classData.current_enrollment} / {classData.max_capacity}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (isFull || booking) && styles.bookButtonDisabled
          ]}
          onPress={handleBookClass}
          disabled={isFull || booking}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>
              {isFull ? 'Class Full' : 'Book This Class'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeFull: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
