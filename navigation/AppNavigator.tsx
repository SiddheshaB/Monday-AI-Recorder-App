import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Import screens
import { MainScreen } from '../screens/MainScreen';
import { TemplatesListScreen } from '../screens/TemplatesListScreen';
import { TemplateDetailScreen } from '../screens/TemplateDetailScreen';
import { CreateEditTemplateScreen } from '../screens/CreateEditTemplateScreen';
import { RecordingsListScreen } from '../screens/RecordingsListScreen';
import { RecordingDetailScreen } from '../screens/RecordingDetailScreen';

// Create the navigator with proper typing
const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Main screen */}
        <Stack.Screen name="Main" component={MainScreen} />
        
        {/* Template screens */}
        <Stack.Screen name="TemplatesList" component={TemplatesListScreen} />
        <Stack.Screen name="TemplateDetail" component={TemplateDetailScreen} />
        <Stack.Screen 
          name="CreateTemplate" 
          component={CreateEditTemplateScreen as any} 
        />
        <Stack.Screen 
          name="EditTemplate" 
          component={CreateEditTemplateScreen as any} 
        />
        
        {/* Recording screens */}
        <Stack.Screen name="RecordingsList" component={RecordingsListScreen} />
        <Stack.Screen name="RecordingDetail" component={RecordingDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
