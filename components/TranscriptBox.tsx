import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface TranscriptBoxProps {
  transcript: string;
}

export const TranscriptBox: React.FC<TranscriptBoxProps> = ({ transcript }) => (
  <View style={styles.transcriptBox}>
    <Text style={styles.transcriptTitle}>Transcript</Text>
    <ScrollView style={styles.scrollView}>
      <Text style={styles.transcriptText}>{transcript.trim()}</Text>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  transcriptBox: {
    width: '100%',
    backgroundColor: '#23262F',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    maxHeight: 200,
  },
  transcriptTitle: {
    color: '#BDBDBD',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  transcriptText: {
    color: '#fff',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});
