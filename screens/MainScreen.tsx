import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { RecordButton } from '../components/RecordButton';
import { TranscriptBox } from '../components/TranscriptBox';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useKeepAwake } from 'expo-keep-awake';
import { background, text } from '../theme/colors';
import { addRecording } from '../utils/recordingStorage';
import { NavigationProp } from '../types/navigation';
import { ToastAndroid } from 'react-native';

export const MainScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const recordingDurationRef = useRef<number>(0);
  
  const {
    isRecordingActive,
    error,
    completeTranscript,
    start,
    stop,
  } = useSpeechToText();

  // Keep the app awake while recording is active
  useKeepAwake(isRecordingActive ? 'speech-recording' : undefined);

  const handleStartRecording = async () => {
    setRecordingStartTime(new Date());
    await start();
  };

  const handleStopRecording = async () => {
    // Calculate recording duration in seconds
    const duration = recordingStartTime 
      ? Math.floor((new Date().getTime() - recordingStartTime.getTime()) / 1000)
      : 0;
    
    recordingDurationRef.current = duration;
    await stop();
    
    // Save the recording if there's a transcript
    if (completeTranscript.trim()) {
      try {
        const recording = await addRecording(completeTranscript, duration);
        
        // Show toast notification instead of alert
        if (Platform.OS === 'android') {
          ToastAndroid.show('Recording saved successfully', ToastAndroid.SHORT);
        } else {
          // For iOS, use a temporary alert that auto-dismisses
          const recordingId = recording.id;
          setTimeout(() => {
            navigation.navigate('RecordingDetail', { recordingId });
          }, 300);
        }
      } catch (error) {
        console.error('Error saving recording:', error);
        Alert.alert('Error', 'Failed to save recording');
      }
    }
    
    // Reset recording start time
    setRecordingStartTime(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header paddingTop={insets.top + 16} />
      
      <View style={styles.container}>
        {/* Recording button in center, fixed position */}
        <View style={styles.buttonContainer}>
          <RecordButton 
            isRecordingActive={isRecordingActive} 
            onPress={isRecordingActive ? handleStopRecording : handleStartRecording} 
          />
          <Text style={styles.recordLabel}>
            {isRecordingActive ? 'Stop Recording' : 'Start Recording'}
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
        
        {/* Transcript at bottom, doesn't affect button position */}
        <View style={styles.transcriptContainer}>
          <TranscriptBox transcript={completeTranscript} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: background.primary,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  buttonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  transcriptContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    maxHeight: '45%',
    zIndex: 2,
  },
  recordLabel: {
    color: text.primary,
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  error: {
    color: text.error,
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});
