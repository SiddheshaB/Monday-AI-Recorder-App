import { useState, useRef, useEffect } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export function useSpeechToText() {
  const [recognizing, setRecognizing] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [completeTranscript, setCompleteTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-restart recognition if it stops while recording is still active
  useEffect(() => {
    if (isRecordingActive && !recognizing) {
      // Wait a short time before restarting to avoid rapid restart loops
      restartTimeoutRef.current = setTimeout(() => {
        console.log('Recognition stopped unexpectedly, restarting...');
        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: false,
          continuous: true,
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
  
  useSpeechRecognitionEvent('end', () => {
    setRecognizing(false);
    // Don't clear the timeout here, let the effect handle restarting
  });
  
  useSpeechRecognitionEvent('result', (event) => {
    const newTranscript = event.results[0]?.transcript.trim() || '';
    setTranscript(newTranscript);
    if (newTranscript) {
      setCompleteTranscript((prev) =>
        prev ? prev + '\n' + newTranscript : newTranscript
      );
    }
  });
  
  useSpeechRecognitionEvent('error', (event) => {
    setError(event.message || 'Speech recognition error');
  });

  const start = async () => {
    setError(null);
    setTranscript('');
    setCompleteTranscript('');
    setIsRecordingActive(true);
    
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      setError('Permission not granted');
      setIsRecordingActive(false);
      return;
    }
    
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: false,
      continuous: true,
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
    start,
    stop,
  };
}
