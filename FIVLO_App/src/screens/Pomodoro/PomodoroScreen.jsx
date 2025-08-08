// src/screens/Pomodoro/PomodoroScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header'; // <-- Header 임포트 확인
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { getPomodoroGoals } from '../../services/pomodoroApi';

const PomodoroScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 목표 목록 로드
  const fetchGoals = async () => {
    setIsLoading(true);
    console.log('포모도로 목표 목록 불러오기 시작...');
    try {
      const data = await getPomodoroGoals();
      console.log('포모도로 목표 목록 API 응답:', data);

      if (Array.isArray(data)) {
        setGoals(data);
      } else {
        console.warn('getPomodoroGoals API에서 배열이 아닌 데이터 수신:', data);
        setGoals([]);
      }
    } catch (error) {
      console.error('포모도로 목표 목록 불러오기 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', '목표 목록을 불러오는데 실패했습니다.');
      setGoals([]);
    } finally {
      setIsLoading(false);
      console.log('포모도로 목표 목록 불러오기 완료.');
    }
  };

  // 화면 포커스 시 목표 목록 다시 로드
  useEffect(() => {
    if (isFocused) {
      fetchGoals();
    }
  }, [isFocused]);


  // "집중 목표 작성하기" 버튼 클릭 핸들러
  const handleCreateGoal = () => {
    navigation.navigate('PomodoroGoalCreation');
  };

  // 기존 목표 선택 핸들러 (목표 목록에서 선택 시)
  const handleSelectGoal = (goal) => {
    Alert.alert('포모도로 시작', `"${goal.title}" 목표로 포모도로를 시작합니다.`);
    navigation.navigate('PomodoroTimer', { selectedGoal: goal });
  };

  const renderGoalItem = ({ item }) => (
    <TouchableOpacity
      style={styles.goalItem}
      onPress={() => handleSelectGoal(item)}
      disabled={isLoading}
    >
      <View style={[styles.goalColorIndicator, { backgroundColor: item.color }]} />
      <Text style={styles.goalText}>{item.title}</Text>
    </TouchableOpacity>
  );


  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="포모도로 기능" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.questionText}>무엇에 집중하고 싶으신가요?</Text>
        
        <CharacterImage style={styles.obooniCharacter} />

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.secondaryBrown} style={styles.loadingIndicator} />
        ) : goals.length > 0 ? (
          <>
            <Text style={styles.existingGoalsTitle}>기존 목표 선택</Text>
            <FlatList
              data={goals}
              renderItem={renderGoalItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.goalsListContent}
              scrollEnabled={false}
            />
            <Text style={styles.orText}>또는</Text>
          </>
        ) : (
          !isLoading && <Text style={styles.noGoalsText}>아직 설정된 포모도로 목표가 없습니다.</Text>
        )}

        <TouchableOpacity style={styles.createGoalButton} onPress={handleCreateGoal} disabled={isLoading}>
          <Text style={styles.createGoalButtonText}>집중 목표 작성하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  loadingIndicator: {
    marginTop: 50,
    marginBottom: 50,
  },
  questionText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 30,
    textAlign: 'center',
  },
  obooniCharacter: {
    width: 200,
    height: 200,
    marginBottom: 50,
  },
  existingGoalsTitle: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 15,
  },
  goalsListContent: {
    width: '100%',
    paddingBottom: 10,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  goalColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  goalText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    flex: 1,
  },
  noGoalsText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  orText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    marginBottom: 20,
    marginTop: 10,
  },
  createGoalButton: {
    backgroundColor: Colors.accentApricot,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createGoalButtonText: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textLight,
  },
});

export default PomodoroScreen;
