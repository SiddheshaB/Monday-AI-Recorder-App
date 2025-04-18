import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recording, RecordingSection } from '../types/recording';

const RECORDINGS_STORAGE_KEY = 'recordings';

// Simple ID generator that doesn't rely on crypto
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
};

// Format date to a readable string
const formatDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get all recordings
export const getRecordings = async (): Promise<Recording[]> => {
  try {
    const recordingsJson = await AsyncStorage.getItem(RECORDINGS_STORAGE_KEY);
    return recordingsJson ? JSON.parse(recordingsJson) : [];
  } catch (error) {
    console.error('Error loading recordings:', error);
    return [];
  }
};

// Save all recordings
export const saveRecordings = async (recordings: Recording[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(recordings));
  } catch (error) {
    console.error('Error saving recordings:', error);
  }
};

// Add a new recording
export const addRecording = async (transcript: string, duration?: number): Promise<Recording> => {
  const newRecording: Recording = {
    id: generateId(),
    title: `Recording ${new Date().toLocaleString()}`,
    transcript,
    date: formatDate(new Date()),
    duration
  };
  
  const recordings = await getRecordings();
  recordings.unshift(newRecording); // Add to the beginning of the array
  await saveRecordings(recordings);
  
  return newRecording;
};

// Get a recording by ID
export const getRecordingById = async (id: string): Promise<Recording | null> => {
  const recordings = await getRecordings();
  return recordings.find(r => r.id === id) || null;
};

// Update a recording
export const updateRecording = async (updatedRecording: Recording): Promise<void> => {
  const recordings = await getRecordings();
  const index = recordings.findIndex(r => r.id === updatedRecording.id);
  
  if (index !== -1) {
    recordings[index] = updatedRecording;
    await saveRecordings(recordings);
  }
};

// Delete a recording
export const deleteRecording = async (id: string): Promise<void> => {
  const recordings = await getRecordings();
  const filteredRecordings = recordings.filter(r => r.id !== id);
  await saveRecordings(filteredRecordings);
};
