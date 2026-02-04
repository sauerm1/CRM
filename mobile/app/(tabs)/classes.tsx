import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import apiService from '../../services/api';
import type { Class } from '../../types';

export default function ClassesScreen() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClasses = async () => {
    try {
      const data = await apiService.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadClasses();
  };

  const renderClass = ({ item }: { item: Class }) => (
    <TouchableOpacity style={styles.classCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.className}>{item.name}</Text>
        {item.capacity && (
          <View style={styles.capacityBadge}>
            <Text style={styles.capacityText}>
              {item.enrolled || 0}/{item.capacity}
            </Text>
          </View>
        )}
      </View>
      
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.details}>
        <Text style={styles.detailText}>👨‍🏫 {item.instructor_name || 'TBA'}</Text>
        <Text style={styles.detailText}>📅 {item.schedule}</Text>
        {item.club_name && <Text style={styles.detailText}>📍 {item.club_name}</Text>}
        {item.duration && <Text style={styles.detailText}>⏱️ {item.duration} min</Text>}
      </View>

      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book Class</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fitness Classes</Text>
        <Text style={styles.headerSubtitle}>{classes.length} classes available</Text>
      </View>

      <FlatList
        data={classes}
        renderItem={renderClass}
        keyExtractor={(item) => item.id || ''}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No classes available</Text>
        }
      />
    </View>
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
  header: {
    backgroundColor: '#22c55e',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  list: {
    padding: 15,
  },
  classCard: {
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
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  capacityBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capacityText: {
    fontSize: 12,
    color: '#22c55e',
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
});
