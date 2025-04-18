import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { background, icon, shadow } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';

interface HeaderProps {
  paddingTop: number;
}

export const Header: React.FC<HeaderProps> = ({ paddingTop }) => {
  const navigation = useNavigation<NavigationProp>();
  
  const handleTemplatesPress = () => {
    navigation.navigate('TemplatesList');
  };
  
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 24,
      paddingTop,
      marginBottom: 2,
    }}>
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={{ 
          width: 44, 
          height: 44, 
          borderRadius: 22, 
          backgroundColor: background.accent, 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginLeft: 16, 
          shadowColor: shadow.color, 
          shadowOffset: { width: 0, height: 2 }, 
          shadowOpacity: 0.13, 
          shadowRadius: 4, 
          elevation: 2 
        }}>
          <MaterialCommunityIcons name="music-box-multiple" size={26} color={icon.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 22, 
            backgroundColor: background.accent, 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginLeft: 16, 
            shadowColor: shadow.color, 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.13, 
            shadowRadius: 4, 
            elevation: 2 
          }}
          onPress={handleTemplatesPress}
        >
          <Ionicons name="document-text-outline" size={26} color={icon.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
