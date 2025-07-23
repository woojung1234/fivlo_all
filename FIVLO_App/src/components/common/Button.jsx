// src/components/common/Button.jsx (예시)
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';

const Button = ({ title, onPress, style, textStyle, primary = true }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        primary ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10, // 둥근 모서리
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // 기본적으로 너비 100%
    marginVertical: 10, // 버튼 간 여백
  },
  primaryButton: {
    backgroundColor: Colors.accentApricot, // 강조색
  },
  secondaryButton: {
    backgroundColor: Colors.secondaryBrown, // 보조색
  },
  buttonText: {
    color: Colors.textLight, // 버튼 텍스트 색상
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
  },
});

export default Button;