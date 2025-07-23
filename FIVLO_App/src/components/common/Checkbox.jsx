// src/components/common/Checkbox.jsx (예시)
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // 아이콘 라이브러리
import { Colors } from '../../styles/color';

const Checkbox = ({ label, isChecked, onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <MaterialCommunityIcons
        name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={24}
        color={isChecked ? Colors.accentApricot : Colors.secondaryBrown}
      />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    marginLeft: 8,
    color: Colors.textDark,
    fontSize: 15,
  },
});

export default Checkbox;