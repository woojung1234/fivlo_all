// src/screens/Pomodoro/PomodoroFinishScreen.jsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { earnCoin } from '../../services/coinApi'; // 코인 적립 API 임포트

const PomodoroFinishScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { selectedGoal } = route.params;
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 코인 지급 로직
  useEffect(() => {
    const giveCoin = async () => {
      if (isPremiumUser) {
        setIsLoading(true);
        try {
          // Postman 2-3 코인 적립 API 호출 (1일 1회 로직은 백엔드에서 관리)
          await earnCoin('pomodoro_completion', 1, `포모도로 완료: ${selectedGoal.title}`);
          console.log('포모도로 완료 코인 지급 성공');
          // Alert.alert('코인 지급', '포모도로 완료로 1코인이 지급되었습니다!');
          setShowCoinModal(true); // 코인 모달 띄우기
        } catch (error) {
          console.error('포모도로 완료 코인 지급 실패:', error.response ? error.response.data : error.message);
          Alert.alert('코인 지급 실패', error.response?.data?.message || '코인 지급 중 문제가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    giveCoin();
  }, [isPremiumUser, selectedGoal.title]); // selectedGoal.title이 변경될 때도 실행되도록 의존성 추가

  // 컴포넌트 마운트 시 음성 알림
  useEffect(() => {
    const speakMessage = async () => {
      try {
        await Speech.speak('25분 집중 완료! 오분이가 칭찬합니다', { language: 'ko-KR' });
      } catch (e) {
        console.warn("Speech synthesis failed", e);
      }
    };
    speakMessage();
  }, []);

  // "집중도 분석 보러가기" 버튼
  const handleGoToAnalysis = () => {
    Alert.alert('이동', '집중도 분석 페이지로 이동합니다.');
    // navigation.navigate('AnalysisGraph'); // 집중도 분석 페이지로 이동
  };

  // "홈 화면으로" 버튼
  const handleGoToHome = () => {
    navigation.popToTop();
    navigation.navigate('Main', { screen: 'HomeTab' });
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="포모도로 기능" showBackButton={true} />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.finishText}>25분 집중 완료 !</Text>
        <Text style={styles.finishMessage}>오분이가 칭찬합니다 ~</Text>
        
        <CharacterImage style={styles.obooniCharacter} />
        
        <View style={styles.buttonContainer}>
          <Button title="집중도 분석 보러가기" onPress={handleGoToAnalysis} style={styles.actionButton} disabled={isLoading} />
          <Button title="홈 화면으로" onPress={handleGoToHome} primary={false} style={styles.actionButton} disabled={isLoading} />
        </View>
      </ScrollView>

      {/* 코인 증정 모달 (20번 이미지) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCoinModal}
        onRequestClose={() => setShowCoinModal(false)}
      >
        <View style={styles.coinModalOverlay}>
          <View style={styles.coinModalContent}>
            <CharacterImage style={styles.modalObooni} />
            <Text style={styles.modalMessage}>
              포모도로 완료{"\n"}오분이가 코인을 드렸습니다{"\n"}고생하셨습니다 ~
            </Text>
            <Button title="확인" onPress={() => setShowCoinModal(false)} style={styles.modalButton} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  loadingOverlay: {
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  finishText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  finishMessage: {
    fontSize: FontSizes.large,
    color: Colors.secondaryBrown,
    marginBottom: 30,
    textAlign: 'center',
  },
  obooniCharacter: {
    width: 250,
    height: 250,
    marginBottom: 50,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
  },
  actionButton: {
    marginBottom: 15,
  },
  coinModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  coinModalContent: {
    backgroundColor: Colors.textLight,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalObooni: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  modalButton: {
    width: '70%',
  },
});

export default PomodoroFinishScreen;
