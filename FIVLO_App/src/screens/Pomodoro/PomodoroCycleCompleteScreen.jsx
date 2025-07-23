// src/screens/Pomodoro/PomodoroCycleCompleteScreen.jsx

import React, { useState } from 'react'; // useState 임포트 추가
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native'; // ActivityIndicator, Alert 임포트 추가
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { updatePomodoroSessionStatus } from '../../services/pomodoroApi'; // API 임포트

const PomodoroCycleCompleteScreen = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { selectedGoal, cycleCount } = route.params;
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // "계속하기" 버튼 (API 연동 준비)
  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // 백엔드에 다음 사이클 시작을 알림 (필요시 API 추가)
      await updatePomodoroSessionStatus(selectedGoal.id, 'start'); // 세션 상태를 start로 업데이트
      console.log('다음 사이클 계속');
      navigation.navigate('PomodoroTimer', { selectedGoal, initialTimeLeft: 25 * 60, initialIsFocusMode: true, initialCycleCount: cycleCount, resume: true });
    } catch (error) {
      console.error('다음 사이클 계속 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || '진행 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // "그만하기" 버튼 (API 연동 준비)
  const handleStop = () => {
    // 최종 완료 화면으로 이동 (PomodoroFinishScreen)
    navigation.navigate('PomodoroFinish', { selectedGoal, isPremiumUser }); // isPremiumUser 전달
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
        <Text style={styles.cycleCompleteText}>{cycleCount} 사이클 완료!</Text>
        
        <CharacterImage style={styles.obooniCharacter} />
        
        <View style={styles.buttonContainer}>
          <Button title="계속하기" onPress={handleContinue} style={styles.actionButton} disabled={isLoading} />
          <Button title="그만하기" onPress={handleStop} primary={false} style={styles.actionButton} disabled={isLoading} />
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
  cycleCompleteText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
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

export default PomodoroCycleCompleteScreen;
