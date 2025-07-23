// src/screens/ObooniCustomizationScreen.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native'; // <-- ScrollView 임포트 추가!
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// FontAwesome5는 이제 Lock 아이콘을 사용하지 않으므로 제거
// import { FontAwesome5 } from '@expo/vector-icons'; 

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles'; // <-- 경로 확인 (screens/ 바로 아래에 있다고 가정)
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';
import Header from '../../components/common/Header';

const ObooniCustomizationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const isPremiumUser = route.params?.isPremiumUser || false;

  const handleGoToCloset = () => {
    navigation.navigate('ObooniCloset');
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="오분이 커스터마이징" showBackButton={true} />

      {/* ScrollView로 contentContainer 내부 내용을 감싸서 스크롤 가능하게 함 */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}> 
        <View style={styles.contentContainer}> {/* 기존 내용 컨테이너 */}
          <Text style={styles.premiumTitle}>오분이 옷장</Text>
          <CharacterImage style={styles.obooniImage} />
          <Text style={styles.premiumMessage}>
            오분이의 옷장을 꾸며주세요!
          </Text>
          <Button title="오분이 옷장으로" onPress={handleGoToCloset} style={styles.actionButton} />
          <Button title="닫기" onPress={() => navigation.goBack()} primary={false} style={styles.actionButton} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  scrollViewContent: { // ScrollView의 contentContainerStyle
    flexGrow: 1, // ScrollView 내부 콘텐츠가 남은 공간을 채우고, 넘치면 스크롤 가능하게 함
    justifyContent: 'center', // 내용을 수직 중앙 정렬
    alignItems: 'center', // 내용을 수평 중앙 정렬
    paddingHorizontal: 20,
    paddingBottom: 40, // 하단 버튼과의 여백
  },
  contentContainer: { // ScrollView 안에 있는 실제 내용 컨테이너 (flexGrow 없이 내부 내용만큼 공간 차지)
    width: '100%', // 너비를 100%로 설정하여 스크롤뷰 패딩을 활용
    alignItems: 'center', // 내부 요소들 중앙 정렬
  },
  premiumTitle: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 20,
  },
  obooniImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  premiumMessage: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButton: {
    width: '100%',
    marginBottom: 15,
  },
});

export default ObooniCustomizationScreen;
