// src/components/common/CharacterImage.jsx (예시)
import React from 'react';
import { Image, StyleSheet } from 'react-native';

// 실제 이미지 경로로 변경해야 합니다.
// 예: assets/images/obooni_default.png
const defaultObooni = require('../../../assets/images/obooni_default.png');
const happyObooni = require('../../../assets/images/obooni_happy.png');
// ... 필요한 다른 오분이 이미지들을 정의

const CharacterImage = ({ state = 'default', style }) => {
  let source;
  switch (state) {
    case 'happy':
      source = happyObooni;
      break;
    case 'default':
    default:
      source = defaultObooni;
      break;
  }

  return <Image source={source} style={[styles.image, style]} resizeMode="contain" />;
};

const styles = StyleSheet.create({
  image: {
    width: 150, // 기본 크기
    height: 150,
    marginVertical: 20,
  },
});

export default CharacterImage;