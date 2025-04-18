import { NativeStackNavigationProp } from '@react-navigation/native-stack';

/**
 * Root navigation stack parameter list
 * Defines all screens and their parameters in the app
 */
export type RootStackParamList = {
  // Main screens
  Main: undefined;
  
  // Template screens
  TemplatesList: undefined;
  TemplateDetail: { templateId: string };
  CreateTemplate: undefined;
  EditTemplate: { templateId: string };
  
  // Recording screens
  RecordingsList: undefined;
  RecordingDetail: { recordingId: string };
};

/**
 * Typed navigation prop for use with useNavigation hook
 */
export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
