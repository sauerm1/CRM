import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClassesStackParamList } from '../navigation/AppNavigator';
import { classesAPI } from '../api';
import { Class } from '../types';

type ClassesScreenProps = {
  navigation: NativeStackNavigationProp<ClassesStackParamList, 'ClassesList'>;
};

export default function ClassesScreen({ navigation }: ClassesScreenProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await classesAPI.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const renderClassItem = ({ item }: { item: Class }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => navigation.navigate('ClassDetail', { classId: item.id })}
    >
      <View style={styles.classHeader}>
        <Text style={styles.className}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          item.current_enrollment >= item.max_capacity && styles.statusBadgeFull
        ]}>
          <Text style={styles.statusText}>
            {item.current_enrollment}/{item.max_capacity}
          </Text>
        </View>
      </View>
      <Text style={styles.classDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.classDetails}>
        <Text style={styles.classInfo}>
          📅 {new Date(item.start_time).toLocaleDateString()}
        </Text>
        <Text style={styles.classInfo}>
          ⏰ {new Date(item.start_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <Text style={styles.classInfo}>📍 {item.location}</Text>
      {item.instructor_name && (
        <Text style={styles.instructor}>👤 {item.instructor_name}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No classes available</Text>
        }
      />
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
  listContainer: {
    padding: 16,
  },
  classCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeFull: {
    backgroundColor: '#FF6B6B',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  classDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  classDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  classInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    paddingVertical: 40,
  },
});
