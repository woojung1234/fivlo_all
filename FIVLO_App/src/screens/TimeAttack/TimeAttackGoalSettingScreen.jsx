// src/screens/TimeAttack/TimeAttackGoalSettingScreen.jsx

import React, { useState, useEffect } from 'react'; // useEffect 임포트 추가
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput , Modal} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

const TimeAttackGoalSettingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { selectedGoal } = route.params;
  const [totalMinutes, setTotalMinutes] = useState('00');

  // TimeAttackTimeInputModal에서 돌아올 때 값을 받는 useEffect
  useEffect(() => {
    if (route.params?.selectedMinutes) {
      setTotalMinutes(route.params.selectedMinutes);
      // 파라미터 초기화 (다음에 돌아왔을 때 중복 업데이트 방지)
      navigation.setParams({ selectedMinutes: undefined });
    }
  }, [route.params?.selectedMinutes]);


  const handleTimeInputPress = () => {
    navigation.navigate('TimeAttackTimeInputModal', {
      initialMinutes: totalMinutes,
      // onTimeSelected는 더 이상 params로 전달하지 않음
    });
  };

  const handleStartAttack = () => {
    const minutes = parseInt(totalMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert('알림', '유효한 시간을 입력해주세요.');
      return;
    }
    Alert.alert('타임어택 시작', `${selectedGoal} 목표에 ${minutes}분 타임어택을 시작합니다.`);
    navigation.navigate('TimeAttackAISubdivision', { selectedGoal, totalMinutes: minutes });
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="타임어택 기능" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <Text style={styles.goalTitle}>{selectedGoal}</Text>
        <Text style={styles.questionText}>몇 분 타임어택에 집중할까요?</Text>

        <TouchableOpacity style={styles.timerInputContainer} onPress={handleTimeInputPress}>
          <Text style={styles.timerText}>{totalMinutes}</Text>
          <Text style={styles.minuteText}>분</Text>
        </TouchableOpacity>

        <Button
          title="시작하기"
          onPress={handleStartAttack}
          style={styles.startButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    paddingTop: 10,
  },
  goalTitle: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  questionText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    marginBottom: 40,
    textAlign: 'center',
  },
  timerInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '80%',
    height: 150,
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingBottom: 20,
  },
  timerText: {
    fontSize: FontSizes.extraLarge * 3,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
  },
  minuteText: {
    fontSize: FontSizes.extraLarge * 1.5,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginLeft: 10,
    marginBottom: 15,
  },
  startButton: {
    width: '100%',
  },
});

export default TimeAttackGoalSettingScreen;
