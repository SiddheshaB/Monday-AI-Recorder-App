import { useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export function useSpeechToText() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [completeTranscript, setCompleteTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event) => {
    const newTranscript = event.results[0]?.transcript.trim() || '';
    setTranscript(newTranscript);
    setCompleteTranscript((prev) =>
      prev ? prev + '\n' + newTranscript : newTranscript
    );
  });
  useSpeechRecognitionEvent('error', (event) => {
    setError(event.message || 'Speech recognition error');
  });

  const start = async () => {
    setError(null);
    setTranscript('');
    setCompleteTranscript('');
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      setError('Permission not granted');
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: false,
      continuous: true,
    });
  };

  const stop = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  return {
    recognizing,
    transcript,
    completeTranscript,
    error,
    start,
    stop,
  };
}
