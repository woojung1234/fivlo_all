// src/screens/Pomodoro/PomodoroTimerScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Animated, Easing, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { updatePomodoroSessionStatus, completePomodoroSession } from '../../services/pomodoroApi';

const FOCUS_TIME = 25 * 60; // 25분 (초 단위)
const BREAK_TIME = 5 * 60; // 5분 (초 단위)

const PomodoroTimerScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { selectedGoal, initialTimeLeft, initialIsFocusMode, initialCycleCount, resume } = route.params || { 
    selectedGoal: { id: 'mock_id', title: '공부하기', color: '#FFD1DC' },
    initialTimeLeft: FOCUS_TIME,
    initialIsFocusMode: true,
    initialCycleCount: 0,
    resume: false,
  };

  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [isRunning, setIsRunning] = useState(resume || false);
  const [isFocusMode, setIsFocusMode] = useState(initialIsFocusMode);
  const [cycleCount, setCycleCount] = useState(initialCycleCount);

  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef(null);
  const needleAngle = useRef(new Animated.Value(0)).current;
  const obooniMovementAnim = useRef(new Animated.Value(0)).current;

  const totalPhaseTime = isFocusMode ? FOCUS_TIME : BREAK_TIME;

  // 타이머 로직
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current);
      handleCycleEnd();
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  // 시계 바늘 각도 업데이트
  useEffect(() => {
    if (totalPhaseTime > 0) {
      const elapsedSeconds = totalPhaseTime - timeLeft;
      const angle = (elapsedSeconds / totalPhaseTime) * 360;
      needleAngle.setValue(angle);
    }
  }, [timeLeft, totalPhaseTime]);

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

  const handleStartPause = async () => {
    setIsLoading(true);
    try {
      if (isRunning) {
        await updatePomodoroSessionStatus(selectedGoal.id, 'pause');
        console.log('포모도로 일시정지 성공');
        navigation.navigate('PomodoroPause', {
          selectedGoal,
          timeLeft,
          isFocusMode,
          cycleCount,
        });
        setIsRunning(false);
      } else {
        await updatePomodoroSessionStatus(selectedGoal.id, 'start');
        console.log('포모도로 시작 성공');
        setIsRunning(true);
      }
    } catch (error) {
      console.error('포모도로 시작/일시정지 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || '타이머 제어 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    navigation.navigate('PomodoroResetConfirmModal', {
      sessionId: selectedGoal.id,
      onConfirm: async () => {
        navigation.popToTop();
        navigation.navigate('Pomodoro');
      },
      onCancel: () => {
        // 모달 닫기만 함
      },
      actualFocusTime: totalPhaseTime - timeLeft,
    });
  };

  const handleCycleEnd = async () => {
    setIsLoading(true);
    try {
      if (isFocusMode) {
        setIsRunning(false);
        navigation.navigate('PomodoroBreakChoice', { selectedGoal, isPremiumUser });
      } else {
        const response = await completePomodoroSession(selectedGoal.id);
        console.log('1사이클 완료 성공:', response);
        setIsRunning(false);
        setCycleCount(prev => prev + 1);
        navigation.navigate('PomodoroCycleComplete', { selectedGoal, cycleCount: cycleCount + 1, isPremiumUser, coinEarned: response.coinEarned });
      }
    } catch (error) {
      console.error('사이클 종료 처리 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || '사이클 종료 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingMinutes = Math.floor(timeLeft / 60);
  const remainingSeconds = timeLeft % 60;

  const animatedRotationStyle = {
    transform: [{ rotate: needleAngle.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    }) }],
  };

  const obooniShake = obooniMovementAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '5deg', '0deg', '-5deg', '0deg'],
  });

  const progressColor = (isFocusMode) => {
    const progressPercentage = ( (totalPhaseTime - timeLeft) / totalPhaseTime ) * 100;
    if (isFocusMode) {
      return needleAngle.interpolate({
        inputRange: [0, 180, 360],
        outputRange: [Colors.accentApricot, '#FF8C00', '#FF4500'],
        extrapolate: 'clamp',
      });
    }
    return Colors.secondaryBrown;
  };

  const animatedBorderColor = progressColor(isFocusMode);


  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="포모도로 기능" showBackButton={true} />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <View style={styles.contentContainer}>
        <Text style={styles.goalText}>{selectedGoal.title}</Text>

        <View style={[styles.timerCircle, { borderColor: animatedBorderColor }]}>
          <Image
            source={require('../../../assets/images/obooni_clock.png')}
            style={styles.obooniClock}
          />
          <Animated.Image
            source={require('../../../assets/images/clock_needle.png')}
            style={[styles.clockNeedle, animatedRotationStyle]}
          />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.remainingTimeText}>
            {`${remainingMinutes.toString().padStart(2, '0')}분 ${remainingSeconds.toString().padStart(2, '0')}초 남았습니다.`}
          </Text>
        </View>

        <Animated.View style={[styles.obooniCharacterWrapper, { transform: [{ rotateY: obooniShake }] }]}>
          <CharacterImage style={styles.obooniCharacter} />
        </Animated.View>

        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.controlButton} onPress={handleStartPause} disabled={isLoading}>
            <FontAwesome5 name={isRunning ? 'pause' : 'play'} size={30} color={Colors.secondaryBrown} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleReset} disabled={isLoading}>
            <FontAwesome5 name="redo" size={30} color={Colors.secondaryBrown} />
          </TouchableOpacity>
        </View>
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
  },
  goalText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 30,
    textAlign: 'center',
  },
  timerCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  obooniClock: {
    width: '100%',
    height: '100%',
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
    fontSize: FontSizes.extraLarge * 1.5,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    position: 'absolute',
    top: '35%',
  },
  remainingTimeText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    position: 'absolute',
    bottom: '25%',
  },
  obooniCharacterWrapper: {
    marginBottom: 50,
  },
  obooniCharacter: {
    width: 200,
    height: 200,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  controlButton: {
    backgroundColor: Colors.textLight,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default PomodoroTimerScreen;
