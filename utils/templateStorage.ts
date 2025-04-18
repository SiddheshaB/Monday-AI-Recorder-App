import AsyncStorage from '@react-native-async-storage/async-storage';
import { Template, DEFAULT_TEMPLATES } from '../types/template';

const TEMPLATES_STORAGE_KEY = 'ai_templates';

// Simple ID generator that doesn't rely on crypto
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
};

// Get all templates (combines default with user-created ones)
export const getTemplates = async (): Promise<Template[]> => {
  try {
    const storedTemplatesJson = await AsyncStorage.getItem(TEMPLATES_STORAGE_KEY);
    const storedTemplates: Template[] = storedTemplatesJson ? JSON.parse(storedTemplatesJson) : [];
    
    // If no stored templates, return just the defaults
    if (storedTemplates.length === 0) {
      return DEFAULT_TEMPLATES;
    }
    
    // Return stored templates (which include defaults if they weren't deleted)
    return storedTemplates;
  } catch (error) {
    console.error('Error loading templates:', error);
    return DEFAULT_TEMPLATES;
  }
};

// Save all templates
export const saveTemplates = async (templates: Template[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving templates:', error);
  }
};

// Add a new template
export const addTemplate = async (template: Omit<Template, 'id'>): Promise<Template> => {
  const newTemplate: Template = {
    ...template,
    id: generateId(),
    sections: template.sections.map(section => ({
      ...section,
      id: generateId()
    }))
  };
  
  const templates = await getTemplates();
  templates.push(newTemplate);
  await saveTemplates(templates);
  
  return newTemplate;
};

// Update an existing template
export const updateTemplate = async (updatedTemplate: Template): Promise<void> => {
  const templates = await getTemplates();
  const index = templates.findIndex(t => t.id === updatedTemplate.id);
  
  if (index !== -1) {
    templates[index] = updatedTemplate;
    await saveTemplates(templates);
  }
};

// Delete a template
export const deleteTemplate = async (templateId: string): Promise<void> => {
  const templates = await getTemplates();
  const filteredTemplates = templates.filter(t => t.id !== templateId);
  await saveTemplates(filteredTemplates);
};

// Get a specific template by ID
export const getTemplateById = async (templateId: string): Promise<Template | null> => {
  const templates = await getTemplates();
  return templates.find(t => t.id === templateId) || null;
};
