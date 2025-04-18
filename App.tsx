import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, View, Button, ScrollView } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export default function App() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [completeTranscript, setCompleteTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("result", (event) => {
    const newTranscript = event.results[0]?.transcript.trim() || "";
    setTranscript(newTranscript);
    setCompleteTranscript((prev) =>
      prev ? prev + "\n" + newTranscript : "\n" + newTranscript
    );
  });
  useSpeechRecognitionEvent("error", (event) => {
    setError(event.message || "Speech recognition error");
  });

  const handleStart = async () => {
    setError(null);
    setTranscript("");
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      setError("Permission not granted");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: false,
      continuous: true
    });
  };

  const handleStop = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech to Text Demo</Text>
      {!recognizing ? (
        <Button title="Start Recording" onPress={handleStart} />
      ) : (
        <Button title="Stop Recording" onPress={handleStop} color="#d00" />
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      {completeTranscript.length > 0 ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptTitle}>Transcript:</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            <Text style={styles.transcriptText}>
              {completeTranscript.trim()}
            </Text>
          </ScrollView>
        </View>
      ) : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  transcriptBox: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#f6f6fa",
    borderRadius: 8,
    padding: 12,
  },
  transcriptTitle: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  transcriptText: {
    fontSize: 16,
  },
});
