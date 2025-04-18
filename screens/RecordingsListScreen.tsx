import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getRecordings, deleteRecording } from '../utils/recordingStorage';
import { Recording } from '../types/recording';
import { background, text, button, shadow } from '../theme/colors';
import { NavigationProp } from '../types/navigation';

export const RecordingsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recordings when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRecordings();
    }, [])
  );

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const loadedRecordings = await getRecordings();
      setRecordings(loadedRecordings);
    } catch (error) {
      console.error('Error loading recordings:', error);
      Alert.alert('Error', 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingPress = (recording: Recording) => {
    navigation.navigate('RecordingDetail', { recordingId: recording.id });
  };

  const handleDeleteRecording = (id: string) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecording(id);
              setRecordings(recordings.filter(r => r.id !== id));
            } catch (error) {
              console.error('Error deleting recording:', error);
              Alert.alert('Error', 'Failed to delete recording');
            }
          }
        }
      ]
    );
  };

  const renderRecordingItem = ({ item }: { item: Recording }) => (
    <TouchableOpacity
      style={styles.recordingItem}
      onPress={() => handleRecordingPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recordingContent}>
        <Text style={styles.recordingTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={styles.recordingDate}>{item.date}</Text>
        <Text style={styles.recordingPreview} numberOfLines={2} ellipsizeMode="tail">
          {item.transcript}
        </Text>
      </View>
      <View style={styles.recordingActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecording(item.id)}
        >
          <MaterialCommunityIcons name="delete-outline" size={22} color={text.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recordings</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={button.primary} />
        </View>
      ) : (
        <FlatList
          data={recordings}
          renderItem={renderRecordingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="microphone-off" 
                size={64} 
                color={text.secondary} 
              />
              <Text style={styles.emptyText}>No recordings yet</Text>
              <Text style={styles.emptySubtext}>
                Your recordings will appear here after you create them
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: text.primary,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  recordingItem: {
    backgroundColor: background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordingContent: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 13,
    color: text.secondary,
    marginBottom: 8,
  },
  recordingPreview: {
    fontSize: 14,
    color: text.secondary,
    lineHeight: 20,
  },
  recordingActions: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  deleteButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: text.secondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
});
