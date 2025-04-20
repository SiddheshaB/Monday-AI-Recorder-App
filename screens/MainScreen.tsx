import React, { useState, useRef, useEffect } from 'react';
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
  // Flag to indicate we need to save a recording as soon as audioUri is available
  const [pendingSave, setPendingSave] = useState(false);
  // Store the duration for the pending recording
  const [pendingDuration, setPendingDuration] = useState<number | null>(null);

  const {
    isRecordingActive,
    error,
    completeTranscript,
    audioUri,
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
    const duration = recordingStartTime
      ? Math.floor((new Date().getTime() - recordingStartTime.getTime()) / 1000)
      : 0;
    recordingDurationRef.current = duration;
    await stop();

    if (completeTranscript.trim()) {
      setPendingDuration(duration); // Save duration for later
      setPendingSave(true); // Trigger save when audioUri is ready
    }
    setRecordingStartTime(null);
  };

  useEffect(() => {
    if (!pendingSave) return;

    // For Android 13+, wait for audioUri; for others, save immediately
    if (Platform.OS === 'android' && Platform.Version >= 33 && !audioUri) {
      console.log('Waiting for audioUri to be set...');
      return; // Wait for audioUri to update
    }

    const saveRecording = async () => {
      try {
        // Save the recording with transcript, duration, and audioUri (if available)
        const recording = await addRecording(
          completeTranscript,
          pendingDuration ?? undefined,
          audioUri ?? undefined
        );
        if (Platform.OS === 'android') {
          ToastAndroid.show('Recording saved successfully', ToastAndroid.SHORT);
        } else {
          const recordingId = recording.id;
          setTimeout(() => {
            navigation.navigate('RecordingDetail', { recordingId });
          }, 300);
        }
      } catch (error) {
        console.error('Error saving recording:', error);
        Alert.alert('Error', 'Failed to save recording');
      } finally {
        setPendingSave(false); // Reset pending flag
        setPendingDuration(null); // Reset duration
      }
    };

    console.log('Saving recording...');
    saveRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSave, audioUri]);

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
          {error && (
            <Text style={styles.error}>{error.message}</Text>
          )}
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
