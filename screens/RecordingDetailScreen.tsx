import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
  ToastAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getRecordingById, updateRecording } from '../utils/recordingStorage';
import { getTemplates, getTemplateById } from '../utils/templateStorage';
import { processTranscriptWithTemplate } from '../services/llmService';
import { Recording } from '../types/recording';
import { Template } from '../types/template';
import { background, text, button, shadow } from '../theme/colors';

type RecordingDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RecordingDetail'>;

export const RecordingDetailScreen: React.FC<RecordingDetailScreenProps> = ({ 
  route, 
  navigation 
}) => {
  const { recordingId } = route.params;
  const [recording, setRecording] = useState<Recording | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    loadRecording();
    loadTemplates();
  }, [recordingId]);

  useEffect(() => {
    // If recording has a templateId, load that template
    if (recording?.templateId) {
      loadSelectedTemplate(recording.templateId);
    }
  }, [recording]);

  // Process transcript when a template is selected
  useEffect(() => {
    if (selectedTemplate && recording) {
      // Only process if the template has changed or there are no processed sections
      if ((!recording.templateId || recording.templateId !== selectedTemplate.id) || 
          !recording.processedSections) {
        processWithTemplate();
      }
    }
  }, [selectedTemplate]);

  const loadRecording = async () => {
    try {
      setLoading(true);
      const recordingData = await getRecordingById(recordingId);
      if (recordingData) {
        setRecording(recordingData);
      } else {
        Alert.alert('Error', 'Recording not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading recording:', error);
      Alert.alert('Error', 'Failed to load recording');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const loadedTemplates = await getTemplates();
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadSelectedTemplate = async (templateId: string) => {
    try {
      const template = await getTemplateById(templateId);
      setSelectedTemplate(template);
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateModalVisible(false);
  };

  const handleTitleEdit = () => {
    if (!recording) return;
    setEditedTitle(recording.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!recording || !editedTitle.trim()) return;
    
    try {
      const updatedRecording: Recording = {
        ...recording,
        title: editedTitle.trim()
      };
      
      await updateRecording(updatedRecording);
      setRecording(updatedRecording);
      setIsEditingTitle(false);
      
      // Show success feedback
      if (Platform.OS === 'android') {
        ToastAndroid.show('Title updated successfully', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error updating recording title:', error);
      Alert.alert('Error', 'Failed to update recording title');
    }
  };

  const processWithTemplate = async () => {
    if (!recording || !selectedTemplate) return;

    try {
      setProcessing(true);
      
      // Process the transcript with the selected template using LLM
      const processedSections = await processTranscriptWithTemplate(
        recording.transcript, 
        selectedTemplate
      );
      
      // Update the recording with the processed sections and template ID
      const updatedRecording: Recording = {
        ...recording,
        templateId: selectedTemplate.id,
        processedSections
      };
      
      await updateRecording(updatedRecording);
      setRecording(updatedRecording);
      
      // Show a toast or subtle notification instead of an alert
      console.log('Transcript processed successfully');
    } catch (error) {
      console.error('Error processing transcript:', error);
      Alert.alert('Error', 'Failed to process transcript');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={button.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!recording) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={text.primary} />
        </TouchableOpacity>
        {isEditingTitle ? (
          <View style={styles.titleEditContainer}>
            <TextInput
              style={styles.titleInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              onSubmitEditing={handleSaveTitle}
              onBlur={handleSaveTitle}
              autoFocus
              returnKeyType="done"
              selectionColor={button.primary}
            />
          </View>
        ) : (
          <TouchableOpacity 
            onPress={handleTitleEdit}
            style={styles.titleContainer}
          >
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              {recording.title}
            </Text>
          </TouchableOpacity>
        )}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recording info */}
        <View style={styles.infoContainer}>
          <Text style={styles.dateText}>{recording.date}</Text>
          {recording.duration && (
            <Text style={styles.durationText}>
              Duration: {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </View>

        {/* Template selection */}
        <View style={styles.templateSection}>
          <Text style={styles.sectionTitle}>Template</Text>
          <TouchableOpacity 
            style={styles.templateSelector}
            onPress={() => setTemplateModalVisible(true)}
            disabled={processing}
          >
            {processing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color={button.primary} />
                <Text style={[styles.templateText, { marginLeft: 10 }]}>
                  Processing with template...
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.templateText}>
                  {selectedTemplate ? selectedTemplate.title : 'Select a template'}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={text.secondary} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Processed sections */}
        {recording.processedSections && (
          <View style={styles.processedSections}>
            <Text style={styles.sectionTitle}>Processed Content</Text>
            {recording.processedSections.map((section, index) => (
              <View key={index} style={styles.processedSection}>
                <Text style={styles.sectionHeader}>{section.title}</Text>
                <Text style={styles.sectionContent}>{section.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Transcript */}
        <View style={styles.transcriptContainer}>
          <Text style={styles.sectionTitle}>Transcript</Text>
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptText}>{recording.transcript}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Template selection modal */}
      <Modal
        visible={templateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTemplateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Template</Text>
              <TouchableOpacity 
                onPress={() => setTemplateModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.templatesList}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateItem,
                    selectedTemplate?.id === template.id && styles.selectedTemplateItem
                  ]}
                  onPress={() => handleSelectTemplate(template)}
                >
                  <Text style={[
                    styles.templateItemTitle,
                    selectedTemplate?.id === template.id && styles.selectedTemplateText
                  ]}>
                    {template.title}
                  </Text>
                  <Text style={styles.templateItemSections}>
                    {template.sections.length} {template.sections.length === 1 ? 'section' : 'sections'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleEditContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: text.primary,
    padding: 0,
    textAlign: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: text.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoContainer: {
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
    color: text.secondary,
    marginBottom: 4,
  },
  durationText: {
    fontSize: 14,
    color: text.secondary,
  },
  templateSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 12,
  },
  templateSelector: {
    backgroundColor: background.secondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateText: {
    fontSize: 16,
    color: text.primary,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  processedSections: {
    marginBottom: 24,
  },
  processedSection: {
    backgroundColor: background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 15,
    color: text.primary,
    lineHeight: 22,
  },
  transcriptContainer: {
    marginBottom: 24,
  },
  transcriptBox: {
    backgroundColor: background.secondary,
    borderRadius: 12,
    padding: 16,
  },
  transcriptText: {
    fontSize: 15,
    color: text.primary,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: text.primary,
  },
  closeButton: {
    padding: 4,
  },
  templatesList: {
    padding: 16,
  },
  templateItem: {
    backgroundColor: background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedTemplateItem: {
    backgroundColor: `${button.primary}40`, // 40 = 25% opacity
    borderWidth: 1,
    borderColor: button.primary,
  },
  templateItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 4,
  },
  selectedTemplateText: {
    color: button.primary,
  },
  templateItemSections: {
    fontSize: 14,
    color: text.secondary,
  },
});
