// src/components/common/Input.jsx (예시)
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../styles/color';
import { FontSizes } from '../../styles/Fonts';

const Input = ({ style, ...props }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={Colors.secondaryBrown} // 플레이스홀더 색상
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    width: '100%',
    backgroundColor: Colors.textLight, // 흰색 또는 라이트 베이지
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    marginVertical: 10,
  },
});

export default Input;