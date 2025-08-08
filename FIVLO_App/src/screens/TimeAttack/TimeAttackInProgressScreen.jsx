// src/screens/TimeAttack/TimeAttackInProgressScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Easing, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { updateTimeAttackSessionStatus, completeTimeAttackSession } from '../../services/timeAttackApi';

const AUTO_NEXT_THRESHOLD = 3000; // 자동 다음 단계 전환 대기 시간 (3초)

const TimeAttackInProgressScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { selectedGoal, subdividedTasks, sessionId } = route.params;

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // 현재 단계의 남은 시간
  const [isRunning, setIsRunning] = useState(true); // 타이머 작동 여부
  const [nextButtonPressTime, setNextButtonPressTime] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef(null);
  const nextTimerRef = useRef(null);
  const minuteHandRotation = useRef(new Animated.Value(0)).current; // 분침 각도
  const progressFill = useRef(new Animated.Value(0)).current; // 진행도
  const obooniMovementAnim = useRef(new Animated.Value(0)).current; // 오분이 움직임 애니메이션

  const currentTask = subdividedTasks[currentTaskIndex];
  const totalTaskDuration = currentTask ? currentTask.duration * 60 : 0; // 현재 Task의 총 시간 (초)

  // 타이머 로직
  useEffect(() => {
    if (currentTask) {
      setTimeLeft(currentTask.duration * 60); // 분을 초로 변환
      setIsRunning(true); // 새 태스크 시작 시 타이머 자동 시작
    } else {
      // 모든 태스크 완료
      navigation.replace('TimeAttackComplete', { selectedGoal, isPremiumUser });
      return;
    }
  }, [currentTaskIndex, subdividedTasks]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current);
      handleTaskComplete();
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  // 시계 바늘 및 진행도 애니메이션 업데이트
  useEffect(() => {
    if (totalTaskDuration > 0) {
      const elapsedSeconds = totalTaskDuration - timeLeft;
      // 분침 회전 (총 시간 대비 현재 진행된 시간의 비율을 360도로 매핑)
      // 0초일 때 0도, totalTaskDuration일 때 360도 회전
      const angle = (elapsedSeconds / totalTaskDuration) * 360;
      minuteHandRotation.setValue(angle);

      // 진행도 바 채우기
      progressFill.setValue(progressPercentage);
    }
  }, [timeLeft, totalTaskDuration]);

  // 오분이 움직임 애니메이션
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.timing(obooniMovementAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      obooniMovementAnim.stopAnimation();
      obooniMovementAnim.setValue(0);
    }
  }, [isRunning]);


  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const speakText = async (text) => {
    try {
      await Speech.speak(text, { language: 'ko-KR' });
    } catch (e) {
      console.warn("Speech synthesis failed", e);
    }
  };

  const handleTaskComplete = async () => {
    setIsLoading(true);
    try {
      // 각 단계 완료 시 백엔드에 상태 업데이트 (API 명세에는 없지만, 필요시 추가)
      // await updateTimeAttackSessionStep(sessionId, currentTask.id, 'completed'); 

      setIsRunning(false);
      const message = `${currentTask.name}을(를) 종료했어요!`;
      speakText(message);

      Alert.alert('단계 완료', message, [
        { text: '확인', onPress: () => {
          handleNextTask();
        }},
      ], { cancelable: false });
    } catch (error) {
      console.error('단계 완료 처리 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || '단계 완료 처리 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < subdividedTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      // 모든 태스크 완료 시 최종 완료 API 호출
      completeTimeAttackSession(sessionId);
      navigation.replace('TimeAttackComplete', { selectedGoal, isPremiumUser });
    }
  };

  const handleNextButtonPressIn = () => {
    setNextButtonPressTime(Date.now());
    nextTimerRef.current = setTimeout(() => {
      handleNextTask();
      clearTimeout(nextTimerRef.current);
    }, AUTO_NEXT_THRESHOLD);
  };

  const handleNextButtonPressOut = () => {
    clearTimeout(nextTimerRef.current);
    if (Date.now() - nextButtonPressTime < AUTO_NEXT_THRESHOLD) {
      Alert.alert('다음 단계로', `${currentTask.name}을(를) 완료했나요?`, [
        { text: '취소', style: 'cancel' },
        { text: '완료', onPress: handleNextTask },
      ]);
    }
  };

  const obooniShake = obooniMovementAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '5deg', '0deg', '-5deg', '0deg'],
  });

  const progressColor = progressFill.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [Colors.accentApricot, '#FF8C00', '#FF4500'],
    extrapolate: 'clamp',
  });

  const animatedBorderColor = progressColor;


  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="타임어택 기능" showBackButton={true} />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <View style={styles.contentContainer}>
        <Text style={styles.goalText}>{selectedGoal}</Text>
        <Text style={styles.currentTaskText}>{currentTask ? currentTask.name : '준비 완료'}</Text>

        {/* 타이머 시각화 (시계 모양) */}
        <View style={styles.timerDisplayContainer}>
          <Animated.View style={[styles.timerCircleOuter, { borderColor: animatedBorderColor }]}>
            <Image
              source={require('../../../assets/images/obooni_clock.png')}
              style={styles.obooniClock}
            />
            <Animated.Image
              source={require('../../../assets/images/clock_needle.png')}
              style={[
                styles.clockNeedle,
                { transform: [{ rotate: minuteHandRotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }]}
            />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.remainingText}>
              {`${Math.floor(timeLeft / 60).toString().padStart(2, '0')}분 ${
              (timeLeft % 60).toString().padStart(2, '0')}초 남았습니다.`}
            </Text>
          </Animated.View>
        </View>

        {/* 오분이 캐릭터 (뛰어다니는 모션) */}
        <Animated.View style={[styles.obooniCharacterWrapper, { transform: [{ rotateY: obooniShake }] }]}>
          <CharacterImage style={styles.obooniCharacter} />
        </Animated.View>

        {/* "다음 단계로" 버튼 */}
        <TouchableOpacity
          style={styles.nextButton}
          onPressIn={handleNextButtonPressIn}
          onPressOut={handleNextButtonPressOut}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>다음 단계로</Text>
        </TouchableOpacity>
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  goalText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  currentTaskText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 40,
    textAlign: 'center',
  },
  timerDisplayContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  timerCircleOuter: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: Colors.textLight,
  },
  obooniClock: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    position: 'absolute',
  },
  clockNeedle: {
    width: '40%',
    height: '40%',
    resizeMode: 'contain',
    position: 'absolute',
    top: '10%',
    left: '30%',
    transformOrigin: 'center center',
  },
  timerText: {
    fontSize: FontSizes.extraLarge * 2.5,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    position: 'absolute',
    // 시계 중앙에 배치
  },
  remainingText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    marginTop: 10,
    position: 'absolute',
    bottom: '20%',
  },
  obooniCharacterWrapper: {
    marginBottom: 50,
  },
  obooniCharacter: {
    width: 200,
    height: 200,
  },
  nextButton: {
    backgroundColor: Colors.accentApricot,
    borderRadius: 150,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textLight,
  },
});

export default TimeAttackInProgressScreen;
