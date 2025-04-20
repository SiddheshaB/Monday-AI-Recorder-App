import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { button, text as textColor } from '../theme/colors';

interface AudioPlayerProps {
  uri: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ uri }) => {
  console.log('AudioPlayer uri:', uri);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handles play/pause logic for the audio file
  const handlePlayPause = async () => {
    try {
      if (!soundRef.current) {
        setLoading(true);
        const { sound } = await Audio.Sound.createAsync({ uri });
        soundRef.current = sound;
        setLoading(false);
        await sound.playAsync();
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setIsPlaying(false);
            sound.unloadAsync();
            soundRef.current = null;
          }
        });
      } else if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error('Error playing audio:', e);
      setLoading(false);
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePlayPause} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={button.primary} />
        ) : (
          <MaterialCommunityIcons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={40}
            color={button.primary}
          />
        )}
      </TouchableOpacity>
      <Text style={styles.label}>{isPlaying ? 'Playing...' : 'Play Recording'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  button: {
    marginRight: 10,
  },
  label: {
    color: textColor.primary,
    fontSize: 16,
  },
});
