import { useState, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system'; 
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export interface SpeechError {
  type: string;
  message: string;
}

export function useSpeechToText() {
  // State for managing speech recognition and audio recording
  const [recognizing, setRecognizing] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [completeTranscript, setCompleteTranscript] = useState('');
  const [error, setError] = useState<SpeechError | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null); // Stores audio file URI
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Only enable audio recording for Android versions ABOVE 33
  const isAndroidAbove13 = Platform.OS === 'android' && Platform.Version > 33;

  useEffect(() => {
    if (isRecordingActive && !recognizing) {
      restartTimeoutRef.current = setTimeout(() => {
        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: false,
          continuous: true,
          ...(isAndroidAbove13 && {
            recordingOptions: {
              persist: true,
              outputDirectory: FileSystem.documentDirectory ?? undefined,
            },
          }),
        });
      }, 500);
    }
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [isRecordingActive, recognizing]);

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event) => {
    const newTranscript = event.results[0]?.transcript.trim() || '';
    setTranscript(newTranscript);
    if (newTranscript) {
      setCompleteTranscript((prev) =>
        prev ? prev + '\n' + newTranscript : newTranscript
      );
    }
  });
  useSpeechRecognitionEvent('audioend', (event) => {
    if (isAndroidAbove13 && event?.uri) {
      console.log('AudioUri:', event.uri);
      setAudioUri(event.uri);
    }
  });
  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event);
    setError({
      type: event.error,
      message: event.message || 'Speech recognition error',
    });
  });

  const start = async () => {
    setError(null);
    setTranscript('');
    setCompleteTranscript('');
    setAudioUri(null); // Reset audioUri on new start
    setIsRecordingActive(true);
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      setError({
        type: 'PERMISSION_DENIED',
        message: 'Permission not granted',
      });
      setIsRecordingActive(false);
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: false,
      continuous: true,
      ...(isAndroidAbove13 && {
        recordingOptions: {
          persist: true,
          outputDirectory: FileSystem.documentDirectory ?? undefined,
        },
      }),
    });
  };

  const stop = () => {
    setIsRecordingActive(false);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    ExpoSpeechRecognitionModule.stop();
  };

  return {
    recognizing,
    isRecordingActive,
    transcript,
    completeTranscript,
    error,
    audioUri, // Expose audioUri for MainScreen
    start,
    stop,
  };
}
