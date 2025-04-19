import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTemplateById } from '../utils/templateStorage';
import { Template } from '../types/template';
import { background, text, button, shadow } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Define screen props using the RootStackParamList
type TemplateDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TemplateDetail'>;

export const TemplateDetailScreen: React.FC<TemplateDetailScreenProps> = ({ 
  route, 
  navigation 
}) => {
  const { templateId } = route.params;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTemplate();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const templateData = await getTemplateById(templateId!);
      if (templateData) {
        setTemplate(templateData);
      } else {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Template not found', ToastAndroid.SHORT);
        } else {
          Alert.alert('Error', 'Template not found');
        }
        navigation.goBack();
      }
    } catch (error) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to load template', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Failed to load template');
      }
      console.error(error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = () => {
    if (template) {
      navigation.navigate('EditTemplate', { templateId: template.id });
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

  if (!template) {
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
        <Text style={styles.headerTitle}>{template.title}</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEditTemplate}
        >
          <MaterialCommunityIcons name="pencil" size={22} color={text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {template.sections.map((section) => (
          <View key={section.id} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionDescription}>{section.description}</Text>
          </View>
        ))}
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: text.primary,
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionContainer: {
    backgroundColor: background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: text.secondary,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
