import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Import screens
import { MainScreen } from '../screens/MainScreen';
import { TemplatesListScreen } from '../screens/TemplatesListScreen';
import { TemplateDetailScreen } from '../screens/TemplateDetailScreen';
import { CreateEditTemplateScreen } from '../screens/CreateEditTemplateScreen';

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
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="TemplatesList" component={TemplatesListScreen} />
        <Stack.Screen name="TemplateDetail" component={TemplateDetailScreen} />
        
        {/* Use the same component for both create and edit screens */}
        <Stack.Screen 
          name="CreateTemplate" 
          component={CreateEditTemplateScreen as any} 
        />
        <Stack.Screen 
          name="EditTemplate" 
          component={CreateEditTemplateScreen as any} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
