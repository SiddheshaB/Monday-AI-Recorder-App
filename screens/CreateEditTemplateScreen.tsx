import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addTemplate, getTemplateById, updateTemplate } from '../utils/templateStorage';
import { Template, TemplateSection } from '../types/template';
import { background, text, button, shadow } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Simple ID generator
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
};

// Define screen props using the RootStackParamList
type CreateTemplateScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateTemplate'>;
type EditTemplateScreenProps = NativeStackScreenProps<RootStackParamList, 'EditTemplate'>;
// Union type to handle both screens with the same component
type CreateEditTemplateScreenProps = CreateTemplateScreenProps | EditTemplateScreenProps;

export const CreateEditTemplateScreen: React.FC<CreateEditTemplateScreenProps> = ({ 
  route, 
  navigation 
}) => {
  const templateId = route.params && 'templateId' in route.params ? route.params.templateId : undefined;
  const isEditing = !!templateId;
  
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<TemplateSection[]>([
    { id: generateId(), title: '', description: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setInitialLoading(true);
      const templateData = await getTemplateById(templateId!);
      if (templateData) {
        setTitle(templateData.title);
        setSections(templateData.sections);
      } else {
        Alert.alert('Error', 'Template not found');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load template');
      console.error(error);
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a template title');
      return;
    }

    const validSections = sections.filter(s => s.title.trim());
    if (validSections.length === 0) {
      Alert.alert('Error', 'Please add at least one section with a title');
      return;
    }

    // Remove empty sections
    const cleanedSections = validSections.map(section => ({
      ...section,
      title: section.title.trim(),
      description: section.description.trim()
    }));

    try {
      setLoading(true);
      
      if (isEditing && templateId) {
        await updateTemplate({
          id: templateId,
          title: title.trim(),
          sections: cleanedSections
        });
        
        // Show toast instead of alert
        if (Platform.OS === 'android') {
          ToastAndroid.show('Template updated successfully', ToastAndroid.SHORT);
        }
      } else {
        await addTemplate({
          title: title.trim(),
          sections: cleanedSections
        });
        
        // Show toast instead of alert
        if (Platform.OS === 'android') {
          ToastAndroid.show('Template created successfully', ToastAndroid.SHORT);
        }
      }
      
      // Navigate back to refresh the list
      navigation.goBack();
    } catch (error) {
      console.error('Error saving template:', error);
      Alert.alert('Error', 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { id: generateId(), title: '', description: '' }]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) {
      Alert.alert('Error', 'Template must have at least one section');
      return;
    }
    
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const updateSectionTitle = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].title = value;
    setSections(newSections);
  };

  const updateSectionDescription = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].description = value;
    setSections(newSections);
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading template...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Template' : 'Create Template'}
          </Text>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Template Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter template title"
              placeholderTextColor={text.secondary}
            />
          </View>

          <Text style={[styles.label, { marginTop: 20, marginBottom: 12 }]}>Sections</Text>

          {sections.map((section, index) => (
            <View key={section.id} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Section {index + 1}</Text>
                <TouchableOpacity 
                  onPress={() => handleRemoveSection(index)}
                  style={styles.removeButton}
                >
                  <MaterialCommunityIcons name="close" size={20} color={text.error} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.input}
                value={section.title}
                onChangeText={(value) => updateSectionTitle(index, value)}
                placeholder="Section title"
                placeholderTextColor={text.secondary}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                value={section.description}
                onChangeText={(value) => updateSectionDescription(index, value)}
                placeholder="Section description"
                placeholderTextColor={text.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          ))}

          <TouchableOpacity 
            style={styles.addSectionButton}
            onPress={handleAddSection}
          >
            <MaterialCommunityIcons name="plus" size={20} color={text.primary} />
            <Text style={styles.addSectionText}>Add Section</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: text.primary,
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: button.primary,
    borderRadius: 6,
  },
  saveButtonText: {
    color: text.primary,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: background.secondary,
    borderRadius: 8,
    padding: 12,
    color: text.primary,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    marginTop: 8,
  },
  sectionContainer: {
    backgroundColor: background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: text.primary,
  },
  removeButton: {
    padding: 4,
  },
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45, 156, 219, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  addSectionText: {
    color: text.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: text.primary,
    fontSize: 16,
  },
});
