import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function MainApp() {
  const insets = useSafeAreaInsets();
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
      prev ? prev + "\n" + newTranscript : newTranscript
    );
  });
  useSpeechRecognitionEvent("error", (event) => {
    setError(event.message || "Speech recognition error");
  });

  const handleStart = async () => {
    setError(null);
    setTranscript("");
    setCompleteTranscript("");
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}> 
        <View style={{ flex: 1 }} />
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconButtonModern} onPress={() => {}} accessibilityLabel="Saved Recordings">
            <MaterialCommunityIcons name="music-box-multiple" size={26} color="#2D9CDB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtonModern} onPress={() => {}} accessibilityLabel="Templates">
            <Ionicons name="document-text-outline" size={26} color="#2D9CDB" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.recordButton, recognizing ? styles.recording : null]}
            onPress={recognizing ? handleStop : handleStart}
            activeOpacity={0.8}
            accessibilityLabel={recognizing ? "Stop Recording" : "Start Recording"}
          >
            <MaterialCommunityIcons
              name={recognizing ? "stop" : "microphone"}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>
          <Text style={styles.recordLabel}>
            {recognizing ? "Stop Recording" : "Start Recording"}
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptTitle}>Transcript</Text>
          <ScrollView style={{ maxHeight: 250 }}>
            <Text style={styles.transcriptText}>{completeTranscript.trim()}</Text>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#181A20",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    marginBottom: 2,
  },
  iconRow: {
    flexDirection: "row"
  },
  iconButtonModern: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(44,62,80,0.7)", 
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  recordButton: {
    backgroundColor: "#2D9CDB",
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recording: {
    backgroundColor: "#EB5757",
  },
  recordLabel: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  error: {
    color: "#EB5757",
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
  },
  transcriptBox: {
    width: "100%",
    backgroundColor: "#23262F",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  transcriptTitle: {
    color: "#BDBDBD",
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  transcriptText: {
    color: "#fff",
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});
