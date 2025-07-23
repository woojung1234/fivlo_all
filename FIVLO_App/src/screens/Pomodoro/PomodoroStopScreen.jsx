// src/screens/Pomodoro/PomodoroStopScreen.jsx

import React, { useState, useEffect } from 'react'; // useState, useEffect 임포트 추가
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native'; // ActivityIndicator, Alert 임포트 추가
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech'; // Speech 임포트 추가

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { completePomodoroSession } from '../../services/pomodoroApi'; // API 임포트

const PomodoroStopScreen = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { selectedGoal, sessionId } = route.params; // sessionId 받기
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 컴포넌트 마운트 시 음성 알림 (예시)
  useEffect(() => {
    const speakMessage = async () => {
      try {
        await Speech.speak('5분 23초 집중 완료! 오분이가 칭찬합니다', { language: 'ko-KR' }); // 임시 메시지
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

      {isLoading && ( // 로딩 스피너 오버레이
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.stopText}>5분 23초 집중 완료 !</Text> {/* 임시 텍스트, 실제로는 전달받은 시간 */}
        <Text style={styles.stopMessage}>오분이가 칭찬합니다 ~</Text>
        
        <CharacterImage style={styles.obooniCharacter} />
        
        <View style={styles.buttonContainer}>
          <Button title="집중도 분석 보러가기" onPress={handleGoToAnalysis} style={styles.actionButton} disabled={isLoading} />
          <Button title="홈 화면으로" onPress={handleGoToHome} primary={false} style={styles.actionButton} disabled={isLoading} />
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
  stopText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  stopMessage: {
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
});

export default PomodoroStopScreen;
