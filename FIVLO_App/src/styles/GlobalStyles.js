// src/styles/GlobalStyles.js (예시)
import { StyleSheet } from 'react-native';
import { Colors } from './color';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBeige, // 앱 기본 배경색
    paddingHorizontal: 20, // 좌우 여백
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBase: {
    fontSize: 16,
    color: Colors.textDark,
    // fontFamily: 'YourAppFont-Regular', // 커스텀 폰트 적용 예시
  },
  // ... 추가적인 공통 스타일
});