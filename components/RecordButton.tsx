import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RecordButtonProps {
  recognizing: boolean;
  onPress: () => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ recognizing, onPress }) => (
  <TouchableOpacity
    style={[styles.recordButton, recognizing ? styles.recording : null]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityLabel={recognizing ? 'Stop Recording' : 'Start Recording'}
  >
    <MaterialCommunityIcons
      name={recognizing ? 'stop' : 'microphone'}
      size={40}
      color="#fff"
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  recordButton: {
    backgroundColor: '#2D9CDB',
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recording: {
    backgroundColor: '#EB5757',
  },
});
