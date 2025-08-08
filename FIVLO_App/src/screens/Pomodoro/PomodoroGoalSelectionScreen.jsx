// src/screens/Pomodoro/PomodoroGoalSelectionScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

// API 서비스 임포트
import { getPomodoroGoals } from '../../services/pomodoroApi';

const PomodoroGoalSelectionScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 목표 목록 로드
  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const data = await getPomodoroGoals();
      if (Array.isArray(data)) {
        setGoals(data);
      } else {
        console.warn('getPomodoroGoals API에서 배열이 아닌 데이터 수신:', data);
        setGoals([]);
      }
    } catch (error) {
      console.error("Failed to fetch pomodoro goals:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '목표 목록을 불러오는데 실패했습니다.');
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 포커스 시 목표 목록 다시 로드
  useEffect(() => {
    if (isFocused) {
      fetchGoals();
    }
  }, [isFocused]);

  // PomodoroGoalCreationScreen에서 새로 추가된 목표를 받아옴
  useEffect(() => {
    if (route.params?.newGoal) {
      setGoals(prevGoals => {
        if (!prevGoals.some(goal => goal.id === route.params.newGoal.id)) {
          return [...prevGoals, route.params.newGoal];
        }
        return prevGoals;
      });
      navigation.setParams({ newGoal: undefined });
    }
  }, [route.params?.newGoal]);

  // 목표 선택 및 포모도로 시작
  const handleSelectGoal = (goal) => {
    Alert.alert('포모도로 시작', `"${goal.title}" 목표로 포모도로를 시작합니다.`);
    navigation.navigate('PomodoroTimer', { selectedGoal: goal });
  };

  // 목표 아이템 렌더링
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
      <Header title="집중 목표 선택" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <Text style={styles.sectionTitle}>무엇에 집중하고 싶으신가요?</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.secondaryBrown} style={styles.loadingIndicator} />
        ) : goals.length > 0 ? (
          <FlatList
            data={goals}
            renderItem={renderGoalItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.goalListContent}
          />
        ) : (
          <Text style={styles.noGoalsText}>등록된 집중 목표가 없습니다.</Text>
        )}

        <Button 
          title="새로운 목표 작성하기" 
          onPress={() => navigation.navigate('PomodoroGoalCreation')} 
          style={styles.createGoalButton}
          disabled={isLoading}
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
  loadingIndicator: {
    marginTop: 50,
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginTop: 25,
    marginBottom: 20,
    width: '100%',
    textAlign: 'center',
  },
  goalListContent: {
    width: '100%',
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
    width: '100%',
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
  },
  createGoalButton: {
    marginTop: 30,
    width: '100%',
  },
});

export default PomodoroGoalSelectionScreen;
