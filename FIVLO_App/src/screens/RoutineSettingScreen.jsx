// src/screens/RoutineSettingScreen.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Modal, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../styles/GlobalStyles';
import { Colors } from '../styles/color';
import { FontSizes, FontWeights } from '../styles/Fonts';
import Header from '../components/common/Header';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// API 서비스 임포트
import { createAIGoal, updateAIGoal, commitAIGoalToTask } from '../services/aiApi';

const RoutineSettingScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [goal, setGoal] = useState('');
  const [targetDate, setTargetDate] = useState(new Date());
  const [isContinuous, setIsContinuous] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const [aiRecommendedTasks, setAiRecommendedTasks] = useState([]);
  const [aiGoalId, setAiGoalId] = useState(null);

  const [isEditingTask, setIsEditingTask] = useState(false);
  const [currentEditingTask, setCurrentEditingTask] = useState(null);
  const [editedTaskText, setEditedTaskText] = useState('');
  const [editedTaskTime, setEditedTaskTime] = useState('');

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || targetDate;
    setShowDatePicker(false);
    setTargetDate(currentDate);
  };

  const handleGenerateSchedule = async () => {
    if (!goal.trim()) {
      Alert.alert('알림', '상위 목표를 입력해주세요.');
      return;
    }

    setIsLoadingAI(true);
    setAiRecommendedTasks([]);

    try {
      const durationText = isContinuous ? "지속" : `${differenceInDays(targetDate, new Date())}일`;
      const response = await createAIGoal(
        goal,
        durationText,
        !isContinuous,
        format(new Date(), 'yyyy-MM-dd'),
        isContinuous ? null : format(targetDate, 'yyyy-MM-dd')
      );
      console.log('AI 목표 세분화 생성 성공:', response);
      setAiGoalId(response.goalId);

      // response.tasks는 [{ title, description, estimatedTime, ... }] 형태의 객체 배열
      const formattedTasks = response.tasks.map(task => ({
        id: task.id || Date.now().toString() + Math.random(), // 백엔드에서 id가 없다면 임시 id 생성
        name: task.title, // <-- task.title 사용
        duration: parseInt(task.estimatedTime) || 0, // <-- task.estimatedTime을 숫자로 파싱
        unit: '분', // 단위는 '분'으로 고정 (백엔드 estimatedTime이 문자열이라 파싱 필요)
        editable: true,
        week: task.week,
      }));
      setAiRecommendedTasks(formattedTasks);

    } catch (error) {
      console.error('AI 목표 세분화 생성 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || 'AI 세분화 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleEditTask = (task) => {
    setCurrentEditingTask(task);
    setEditedTaskText(task.name);
    setEditedTaskTime(task.duration.toString());
    setIsEditingTask(true);
  };

  const handleSaveEditedTask = async () => {
    const duration = parseInt(editedTaskTime, 10);
    if (isNaN(duration) || duration < 0) {
      Alert.alert('알림', '유효한 시간을 입력해주세요.');
      return;
    }

    setIsLoadingAI(true);
    try {
      // AI 목표 수정 API 호출 (Postman 7-2)
      // 백엔드 API는 weeklyPlans를 통째로 받으므로, 현재 aiRecommendedTasks를 백엔드 형식에 맞춰 변환
      const updatedWeeklyPlans = [{ // 예시: 모든 태스크를 1주차로 묶음
        week: 1,
        tasks: aiRecommendedTasks.map(task => {
          if (task.id === currentEditingTask.id) {
            return { title: editedTaskText, estimatedTime: `${duration}분` }; // 수정된 내용 반영
          }
          return { title: task.name, estimatedTime: `${task.duration}분` }; // 기존 내용 유지
        })
      }];

      const response = await updateAIGoal(aiGoalId, {
        weeklyPlans: updatedWeeklyPlans,
      });
      console.log('AI 목표 수정 성공:', response);

      setAiRecommendedTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === currentEditingTask.id ? { ...task, name: editedTaskText, duration: duration } : task
        )
      );
      Alert.alert('저장 완료', '일정이 수정되었습니다.');

    } catch (error) {
      console.error('AI 목표 수정 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || '일정 수정 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingAI(false);
      setIsEditingTask(false);
      setCurrentEditingTask(null);
      setEditedTaskText('');
      setEditedTaskTime('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTask(false);
    setCurrentEditingTask(null);
    setEditedTaskText('');
    setEditedTaskTime('');
  };

  // "테스크로 넘어감" 버튼 클릭 핸들러 (AI 목표를 Task에 추가 API 연동)
  const handleProceedToTasks = async () => {
    if (!aiGoalId) {
      Alert.alert('알림', '먼저 AI 세분화를 생성해주세요.');
      return;
    }
    setIsLoadingAI(true);
    try {
      // Postman 7-3 AI 목표를 Task에 추가 API 호출
      const response = await commitAIGoalToTask(
        aiGoalId,
        isContinuous ? "daily" : "weekly", // 반복 타입 (Postman 가이드에 따라)
        format(new Date(), 'yyyy-MM-dd') // 시작일은 오늘
      );
      console.log('AI 목표 Task 추가 성공:', response);
      Alert.alert('Task 추가 완료', `${response.tasksCreatedCount || 0}개의 Task가 추가되었습니다.`);
      navigation.navigate('TaskCalendar');
    } catch (error) {
      console.error('AI 목표 Task 추가 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || 'Task 추가 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const renderAiTaskItem = ({ item }) => (
    <View style={styles.aiTaskItem}>
      <Text style={styles.aiTaskText}>{item.name}</Text>
      <View style={styles.aiTaskActions}>
        <TouchableOpacity onPress={() => handleEditTask(item)} style={styles.aiTaskActionButton} disabled={isLoadingAI}>
          <FontAwesome5 name="edit" size={20} color={Colors.secondaryBrown} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="루틴 설정" showBackButton={true} />

      {isLoadingAI && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
          <Text style={styles.loadingText}>오분이가 당신을 위한 루틴을 만들고 있어요!</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <Text style={styles.sectionTitle}>달성하고자 하는 목표를 작성/입력하는 칸</Text>
        <Input
          placeholder="예: 2개월 안에 건강하게 5kg 감량하기"
          value={goal}
          onChangeText={setGoal}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
          style={styles.goalInput}
          editable={!isLoadingAI}
        />

        <Text style={styles.sectionTitle}>목표 달성기간 설정하는 칸</Text>
        <View style={styles.dateOptionContainer}>
          <TouchableOpacity
            style={[styles.dateOptionButton, isContinuous && styles.dateOptionButtonActive]}
            onPress={() => setIsContinuous(true)}
            disabled={isLoadingAI}
          >
            <Text style={[styles.dateOptionText, isContinuous && styles.dateOptionTextActive]}>종료 기한 없이 지속</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateOptionButton, !isContinuous && styles.dateOptionButtonActive]}
            onPress={() => setIsContinuous(false)}
            disabled={isLoadingAI}
          >
            <Text style={[styles.dateOptionText, !isContinuous && styles.dateOptionTextActive]}>달성 기간 설정</Text>
          </TouchableOpacity>
        </View>

        {!isContinuous && (
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton} disabled={isLoadingAI}>
            <Text style={styles.datePickerButtonText}>
              {format(targetDate, 'yyyy년 MM월 dd일')}
            </Text>
          </TouchableOpacity>
        )}
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={targetDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}

        <Button
          title="맞춤일정 생성하기"
          onPress={handleGenerateSchedule}
          style={styles.generateButton}
          disabled={isLoadingAI || !goal.trim()}
        />

        {aiRecommendedTasks.length > 0 && !isLoadingAI && (
          <View style={styles.aiRecommendationsContainer}>
            <Text style={styles.aiRecommendationsTitle}>오분이가 추천하는 반복일정</Text>
            {isContinuous ? (
              <FlatList
                data={aiRecommendedTasks}
                renderItem={renderAiTaskItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.aiFlatListContent}
              />
            ) : (
              <FlatList
                data={aiRecommendedTasks}
                renderItem={renderAiTaskItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.aiFlatListContent}
              />
            )}
          </View>
        )}

        {aiRecommendedTasks.length > 0 && !isLoadingAI && (
          <Button
            title="테스크로 넘어감"
            onPress={handleProceedToTasks}
            primary={false}
            style={styles.proceedToTasksButton}
            disabled={isLoadingAI}
          />
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={isEditingTask}
          onRequestClose={handleCancelEdit}
        >
          <View style={styles.editModalOverlay}>
            <View style={styles.editModalContent}>
              <Text style={styles.editModalTitle}>일정 수정</Text>
              <View style={styles.editModalInputContainer}>
                <TextInput
                  style={styles.editModalTextInput}
                  value={editedTaskText}
                  onChangeText={setEditedTaskText}
                  placeholder="목표 내용"
                  editable={!isLoadingAI}
                />
                <TextInput
                  style={styles.editModalTimeInput}
                  value={editedTaskTime}
                  onChangeText={(text) => setEditedTaskTime(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="분"
                  editable={!isLoadingAI}
                />
                <Text style={styles.editModalTimeUnit}>분</Text>
              </View>
              <View style={styles.editModalButtons}>
                <Button title="취소" onPress={handleCancelEdit} primary={false} style={styles.editModalButton} disabled={isLoadingAI} />
                <Button title="저장" onPress={handleSaveEditedTask} style={styles.editModalButton} disabled={isLoadingAI} />
              </View>
            </View>
          </View>
        </Modal>
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
  loadingText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.secondaryBrown,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 30,
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
    marginBottom: 10,
    width: '100%',
    textAlign: 'left',
  },
  goalInput: {
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    minHeight: 100,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateOptionContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateOptionButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  dateOptionButtonActive: {
    backgroundColor: Colors.accentApricot,
  },
  dateOptionText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    fontWeight: FontWeights.regular,
  },
  dateOptionTextActive: {
    color: Colors.textLight,
    fontWeight: FontWeights.bold,
  },
  datePickerButton: {
    width: '100%',
    backgroundColor: Colors.textLight,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  datePickerButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    fontWeight: FontWeights.regular,
  },
  generateButton: {
    marginTop: 10,
    marginBottom: 30,
  },
  aiRecommendationsContainer: {
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  aiRecommendationsTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 15,
  },
  aiFlatListContent: {
    paddingBottom: 10,
  },
  aiTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryBeige,
  },
  aiTaskText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    flex: 1,
    marginRight: 10,
  },
  aiTaskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTaskActionButton: {
    padding: 5,
    marginRight: 10,
  },
  addTaskButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.accentApricot,
    minWidth: 100,
  },
  addTaskButtonText: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.bold,
    color: Colors.textLight,
  },
  weeklyGoalsPlaceholder: {
    width: '100%',
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  placeholderText: {
    fontSize: FontSizes.small,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    lineHeight: 20,
  },
  proceedToTasksButton: {
    width: '100%',
    marginBottom: 15,
  },
  editModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  editModalContent: {
    backgroundColor: Colors.textLight,
    borderRadius: 20,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  editModalTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 20,
  },
  editModalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  editModalTextInput: {
    flex: 1,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    minHeight: 50,
    textAlignVertical: 'center',
  },
  editModalTimeInput: {
    width: 60,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    textAlign: 'right',
    marginRight: 5,
  },
  editModalTimeUnit: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  editModalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default RoutineSettingScreen;
