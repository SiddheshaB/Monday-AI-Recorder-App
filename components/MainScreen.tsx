import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from './Header';
import { RecordButton } from './RecordButton';
import { TranscriptBox } from './TranscriptBox';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { background, text } from '../theme/colors';

export const MainScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    recognizing,
    error,
    completeTranscript,
    start,
    stop,
  } = useSpeechToText();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header paddingTop={insets.top + 16} />
      
      <View style={styles.container}>
        {/* Recording button in center, fixed position */}
        <View style={styles.buttonContainer}>
          <RecordButton recognizing={recognizing} onPress={recognizing ? stop : start} />
          <Text style={styles.recordLabel}>
            {recognizing ? 'Stop Recording' : 'Start Recording'}
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
