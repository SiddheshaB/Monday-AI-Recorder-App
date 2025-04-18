import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  paddingTop: number;
}

export const Header: React.FC<HeaderProps> = ({ paddingTop }) => (
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
      <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(44,62,80,0.7)', alignItems: 'center', justifyContent: 'center', marginLeft: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 4, elevation: 2 }}>
        <MaterialCommunityIcons name="music-box-multiple" size={26} color="#2D9CDB" />
      </TouchableOpacity>
      <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(44,62,80,0.7)', alignItems: 'center', justifyContent: 'center', marginLeft: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 4, elevation: 2 }}>
        <Ionicons name="document-text-outline" size={26} color="#2D9CDB" />
      </TouchableOpacity>
    </View>
  </View>
);
