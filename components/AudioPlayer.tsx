import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { button, text as textColor } from '../theme/colors';

interface AudioPlayerProps {
  uri: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ uri }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0); // in ms
  const [position, setPosition] = useState(0); // in ms
  const [isSeeking, setIsSeeking] = useState(false);

  // Handles play/pause logic for the audio file
  const handlePlayPause = async () => {
    try {
      if (!soundRef.current) {
        setLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          {},
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        setLoading(false);
        await sound.playAsync();
        setIsPlaying(true);
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

  // Update position/duration as audio plays
  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    if (status.durationMillis !== undefined) setDuration(status.durationMillis);
    if (!isSeeking && status.positionMillis !== undefined) setPosition(status.positionMillis);
    if (status.didJustFinish) {
      setIsPlaying(false);
      soundRef.current?.unloadAsync();
      soundRef.current = null;
      setPosition(0);
    }
  };

  // Handle user seeking
  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleSlidingComplete = async (value: number) => {
    setIsSeeking(false);
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value);
      setPosition(value);
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
      <View style={{ flex: 1 }}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          minimumTrackTintColor={button.primary}
          maximumTrackTintColor="#ccc"
          thumbTintColor={button.primary}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatMillis(position)}</Text>
          <Text style={styles.time}>{formatMillis(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

function formatMillis(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

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
  slider: {
    width: '100%',
    height: 30,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  time: {
    color: textColor.primary,
    fontSize: 12,
  },
  label: {
    color: textColor.primary,
    fontSize: 16,
  },
});
