import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTemplates } from '../utils/templateStorage';
import { Template } from '../types/template';
import { background, text, button, shadow } from '../theme/colors';

// This would normally come from a navigation library like react-navigation
interface TemplatesListScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const TemplatesListScreen: React.FC<TemplatesListScreenProps> = ({ navigation }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const loadedTemplates = await getTemplates();
      setTemplates(loadedTemplates);
    } catch (error) {
      Alert.alert('Error', 'Failed to load templates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplatePress = (template: Template) => {
    navigation.navigate('TemplateDetail', { templateId: template.id });
  };

  const handleAddTemplate = () => {
    navigation.navigate('CreateTemplate');
  };

  const renderTemplateItem = ({ item }: { item: Template }) => (
    <TouchableOpacity
      style={styles.templateItem}
      onPress={() => handleTemplatePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.templateContent}>
        <Text style={styles.templateTitle}>{item.title}</Text>
        <Text style={styles.templateSections}>
          {item.sections.length} {item.sections.length === 1 ? 'section' : 'sections'}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={text.secondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Templates</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={button.primary} />
        </View>
      ) : (
        <>
          <FlatList
            data={templates}
            renderItem={renderTemplateItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No templates found</Text>
              </View>
            }
          />

          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddTemplate}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={24} color={text.primary} />
          </TouchableOpacity>
        </>
      )}
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
  listContent: {
    padding: 16,
  },
  templateItem: {
    backgroundColor: background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: text.primary,
    marginBottom: 4,
  },
  templateSections: {
    fontSize: 14,
    color: text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: text.secondary,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: button.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
