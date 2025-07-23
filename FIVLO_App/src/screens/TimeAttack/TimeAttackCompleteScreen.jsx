// src/screens/TimeAttack/TimeAttackCompleteScreen.jsx

import React, { useEffect, useState } from 'react'; // useState 임포트 추가
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native'; // ActivityIndicator, Alert 임포트 추가
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech'; // Speech 임포트 추가

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import CharacterImage from '../../components/common/CharacterImage';
import Button from '../../components/common/Button';

// API 서비스 임포트
import { earnCoin } from '../../services/coinApi'; // 코인 적립 API 임포트

const TimeAttackCompleteScreen = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { selectedGoal } = route.params;
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 코인 지급 로직
  useEffect(() => {
    const giveCoin = async () => {
      if (isPremiumUser) {
        setIsLoading(true);
        try {
          // Postman 2-3 코인 적립 API 호출 (1일 1회 로직은 백엔드에서 관리)
          await earnCoin('time_attack_completion', 1, '타임어택 완료');
          console.log('타임어택 완료 코인 지급 성공');
          Alert.alert('코인 지급', '타임어택 완료로 1코인이 지급되었습니다!');
        } catch (error) {
          console.error('타임어택 완료 코인 지급 실패:', error.response ? error.response.data : error.message);
          Alert.alert('코인 지급 실패', error.response?.data?.message || '코인 지급 중 문제가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    giveCoin();
  }, [isPremiumUser]);

  // 컴포넌트 마운트 시 음성 알림
  useEffect(() => {
    const speakMessage = async () => {
      try {
        await Speech.speak('완료 준비 완료! 오분이가 칭찬합니다', { language: 'ko-KR' });
      } catch (e) {
        console.warn("Speech synthesis failed", e);
      }
    };
    speakMessage();
  }, []);

  const handleGoToHome = () => {
    navigation.popToTop();
    navigation.navigate('Main', { screen: 'HomeTab' });
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="타임어택 기능" showBackButton={true} />

      {isLoading && ( // 로딩 스피너 오버레이
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <View style={styles.contentContainer}>
        <Text style={styles.completeText}>완료 준비 완료!</Text>
        <Text style={styles.praiseText}>오분이가 칭찬합니다 ~</Text>
        
        <CharacterImage style={styles.obooniCharacter} />
        
        <Button title="홈화면으로" onPress={handleGoToHome} style={styles.homeButton} disabled={isLoading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  loadingOverlay: { // 로딩 스피너 오버레이
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  completeText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  praiseText: {
    fontSize: FontSizes.large,
    color: Colors.secondaryBrown,
    marginBottom: 50,
    textAlign: 'center',
  },
  obooniCharacter: {
    width: 250,
    height: 250,
    marginBottom: 50,
  },
  homeButton: {
    width: '80%',
  },
});

export default TimeAttackCompleteScreen;
