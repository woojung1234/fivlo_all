// src/screens/TimeAttack/TimeAttackScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

// API 서비스 임포트
import { getAIRoutineSuggestions } from '../../services/aiApi';

const TimeAttackScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [customGoal, setCustomGoal] = useState('');
  const [aiRecommendedGoals, setAiRecommendedGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // AI 추천 목표 로드
  const fetchAIRoutineSuggestions = async () => {
    setIsLoading(true);
    try {
      // Postman 7-5 AI 루틴 추천 API 호출
      const data = await getAIRoutineSuggestions({
        focusArea: 'productivity',
        timeAvailable: 60,
        currentLevel: 'beginner',
      });
      if (data && data.routines) {
        setAiRecommendedGoals(data.routines.map((routine, index) => ({
          id: `ai_${index}`,
          text: routine.name,
        })));
      } else {
        setAiRecommendedGoals([]);
      }
    } catch (error) {
      console.error("Failed to fetch AI routine suggestions:", error.response ? error.response.data : error.message);
      Alert.alert('오류', 'AI 추천 목표를 불러오는데 실패했습니다.');
      setAiRecommendedGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 포커스 시 AI 추천 목표 로드
  useEffect(() => {
    if (isFocused) {
      fetchAIRoutineSuggestions();
    }
  }, [isFocused]);


  // AI 추천 목표 선택 또는 사용자 맞춤 목표 입력
  const handleSelectGoal = (goalText) => {
    if (!goalText.trim()) {
      Alert.alert('알림', '목표를 선택하거나 입력해주세요.');
      return;
    }
    Alert.alert('목표 선택', `"${goalText}" 목표로 타임어택을 시작합니다.`);
    navigation.navigate('TimeAttackGoalSetting', { selectedGoal: goalText });
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="타임어택 기능" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.accentApricot} />
          </View>
        )}

        <Text style={styles.sectionTitle}>타임어택을 위한 목표는 무엇인가요?</Text>

        {/* AI 추천 목표 */}
        {aiRecommendedGoals.length > 0 ? (
          <View style={styles.aiGoalsContainer}>
            {aiRecommendedGoals.map(goal => (
              <TouchableOpacity
                key={goal.id}
                style={styles.aiGoalButton}
                onPress={() => handleSelectGoal(goal.text)}
                disabled={isLoading}
              >
                <Text style={styles.aiGoalButtonText}>{goal.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          !isLoading && <Text style={styles.noAiGoalsText}>AI 추천 목표가 없습니다.</Text>
        )}

        {/* 사용자 맞춤 설정 칸 */}
        <Text style={styles.sectionTitle}>직접 설정</Text>
        <TextInput
          style={styles.customGoalInput}
          placeholder="직접 입력하기"
          placeholderTextColor={Colors.secondaryBrown}
          value={customGoal}
          onChangeText={setCustomGoal}
          editable={!isLoading}
        />

        {/* 시작하기 버튼 */}
        <Button
          title="시작하기"
          onPress={() => handleSelectGoal(customGoal || (aiRecommendedGoals.length > 0 ? aiRecommendedGoals[0].text : ''))}
          style={styles.startButton}
          disabled={(!customGoal && aiRecommendedGoals.length === 0) || isLoading}
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
  scrollViewContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginTop: 25,
    marginBottom: 15,
    width: '100%',
    textAlign: 'left',
  },
  aiGoalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 20,
  },
  aiGoalButton: {
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aiGoalButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  noAiGoalsText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    width: '100%',
    marginBottom: 20,
  },
  customGoalInput: {
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 30,
  },
  startButton: {
    width: '100%',
  },
});

export default TimeAttackScreen;
