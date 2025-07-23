// src/components/common/Header.jsx (예시)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 아이콘 라이브러리
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../styles/color';
import { FontWeights, FontSizes } from '../../styles/Fonts';

const Header = ({ title, showBackButton = true }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.headerContainer}>
      {showBackButton && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {/* 오른쪽 여백을 위해 빈 뷰를 추가 (필요 시 아이콘 등 추가) */}
      {showBackButton && <View style={{ width: 24 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 15, // 상단 패딩
    // backgroundColor: Colors.primaryBeige, // 배경색은 페이지에서 결정
    borderBottomWidth: 0, // 필요 시 하단 선 추가
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5, // 터치 영역 확장
  },
  headerTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
  },
});

export default Header;