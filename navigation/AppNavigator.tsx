import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainScreen } from '../components/MainScreen';
import { TemplatesListScreen } from '../screens/TemplatesListScreen';
import { TemplateDetailScreen } from '../screens/TemplateDetailScreen';
import { CreateEditTemplateScreen } from '../screens/CreateEditTemplateScreen';

const Stack = createNativeStackNavigator();

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
        <Stack.Screen name="CreateTemplate" component={CreateEditTemplateScreen} />
        <Stack.Screen name="EditTemplate" component={CreateEditTemplateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
