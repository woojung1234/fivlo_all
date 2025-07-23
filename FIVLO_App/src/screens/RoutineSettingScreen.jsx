// src/screens/RoutineSettingScreen.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Modal, TextInput, FlatList } from 'react-native'; // FlatList 임포트 추가
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays } from 'date-fns'; // differenceInDays 임포트 추가
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
import { createAIGoal, updateAIGoal, commitAIGoalToTask } from '../services/aiApi'; // AI API 임포트

const RoutineSettingScreen = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [goal, setGoal] = useState(''); // 상위 목표 입력
  const [targetDate, setTargetDate] = useState(new Date()); // 달성 기간 설정
  const [isContinuous, setIsContinuous] = useState(false); // 종료 기한 없이 지속 여부
  const [showDatePicker, setShowDatePicker] = useState(false); // 날짜 선택기 표시 여부
  const [isLoadingAI, setIsLoadingAI] = useState(false); // AI 로딩 상태

  const [aiRecommendedTasks, setAiRecommendedTasks] = useState([]); // AI가 추천하는 단기 계획 목록
  const [aiGoalId, setAiGoalId] = useState(null); // 백엔드에서 생성된 AI 목표 ID

  const [isEditingTask, setIsEditingTask] = useState(false); // 수정 모달 표시 여부
  const [currentEditingTask, setCurrentEditingTask] = useState(null); // 현재 수정 중인 태스크
  const [editedTaskText, setEditedTaskText] = useState(''); // 수정된 태스크 텍스트
  const [editedTaskTime, setEditedTaskTime] = useState(''); // 수정된 태스크 시간

  // 날짜 선택기 변경 핸들러
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || targetDate;
    setShowDatePicker(false);
    setTargetDate(currentDate);
  };

  // "맞춤일정 생성하기" 클릭 핸들러 (AI 세분화 요청)
  const handleGenerateSchedule = async () => {
    if (!goal.trim()) {
      Alert.alert('알림', '상위 목표를 입력해주세요.');
      return;
    }

    setIsLoadingAI(true);
    setAiRecommendedTasks([]); // 이전 목록 초기화

    try {
      const durationText = isContinuous ? "지속" : `${differenceInDays(targetDate, new Date())}일`;
      const response = await createAIGoal(
        goal,
        durationText,
        !isContinuous, // hasDuration
        format(new Date(), 'yyyy-MM-dd'), // 시작일은 오늘
        isContinuous ? null : format(targetDate, 'yyyy-MM-dd') // 종료일
      );
      console.log('AI 목표 세분화 생성 성공:', response);
      setAiGoalId(response.id); // 생성된 AI 목표 ID 저장

      // API 응답에서 주간 계획 (weeklyPlans)을 가져와서 표시
      // Postman 가이드에 weeklyPlans가 배열 안에 tasks 배열로 되어 있으므로, 이를 FlatList에 맞게 변환
      const formattedTasks = [];
      response.weeklyPlans.forEach(weekPlan => {
        weekPlan.tasks.forEach((taskText, index) => {
          formattedTasks.push({
            id: `${weekPlan.week}-${index}`, // 고유 ID
            name: taskText,
            duration: 0, // AI가 시간까지 주지 않으면 0으로 설정
            unit: '분',
            editable: true,
            week: weekPlan.week, // 주차 정보
          });
        });
      });
      setAiRecommendedTasks(formattedTasks);

    } catch (error) {
      console.error('AI 목표 세분화 생성 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || 'AI 세분화 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // AI 추천 태스크 수정 아이콘 클릭 핸들러
  const handleEditTask = (task) => {
    setCurrentEditingTask(task);
    setEditedTaskText(task.name);
    setEditedTaskTime(task.duration.toString());
    setIsEditingTask(true);
  };

  // 수정 모달 저장 핸들러 (AI 목표 수정 API 연동)
  const handleSaveEditedTask = async () => {
    const duration = parseInt(editedTaskTime, 10);
    if (isNaN(duration) || duration < 0) {
      Alert.alert('알림', '유효한 시간을 입력해주세요.');
      return;
    }

    setIsLoadingAI(true); // 로딩 시작
    try {
      // AI 목표 수정 API 호출 (Postman 7-2)
      // 여기서는 특정 주차의 특정 Task만 수정하는 로직이 복잡하므로, 전체 weeklyPlans를 다시 보내는 방식으로 가정
      // 실제 백엔드 API는 개별 Task 수정 엔드포인트를 제공할 수도 있습니다.
      const updatedWeeklyPlans = aiRecommendedTasks.map(task => {
        if (task.id === currentEditingTask.id) {
          return { week: task.week, tasks: [editedTaskText] }; // 수정된 텍스트 반영
        }
        return { week: task.week, tasks: [task.name] }; // 기존 텍스트 유지
      });
      // 중복 주차 제거 및 tasks 배열 병합 로직 필요 (백엔드 명세에 따라)

      const response = await updateAIGoal(aiGoalId, {
        // goal: goal, // 목표 문구도 함께 업데이트할 수 있음
        weeklyPlans: updatedWeeklyPlans, // 수정된 주간 계획 전달
      });
      console.log('AI 목표 수정 성공:', response);

      // UI 업데이트 (수정된 텍스트 반영)
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

  // 수정 모달 취소 핸들러
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
    setIsLoadingAI(true); // 로딩 시작
    try {
      // Postman 7-3 AI 목표를 Task에 추가 API 호출
      const response = await commitAIGoalToTask(
        aiGoalId,
        isContinuous ? "daily" : "weekly", // 반복 타입 (예시)
        format(new Date(), 'yyyy-MM-dd') // 시작일은 오늘
      );
      console.log('AI 목표 Task 추가 성공:', response);
      Alert.alert('Task 추가 완료', `${response.tasksCreatedCount || 0}개의 Task가 추가되었습니다.`);
      navigation.navigate('TaskCalendar'); // Task 캘린더 화면으로 이동
    } catch (error) {
      console.error('AI 목표 Task 추가 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || 'Task 추가 중 문제가 발생했습니다.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // AI 추천 태스크 아이템 렌더링
  const renderAiTaskItem = ({ item }) => (
    <View style={styles.aiTaskItem}>
      <Text style={styles.aiTaskText}>{item.name}</Text>
      <View style={styles.aiTaskActions}>
        <TouchableOpacity onPress={() => handleEditTask(item)} style={styles.aiTaskActionButton} disabled={isLoadingAI}>
          <FontAwesome5 name="edit" size={20} color={Colors.secondaryBrown} />
        </TouchableOpacity>
        {/* TASK에 추가하기 버튼은 전체 커밋으로 대체되므로 개별 버튼은 제거 */}
        {/* <Button
          title="TASK에 추가하기"
          onPress={() => handleAddTaskToTask(item)}
          style={styles.addTaskButton}
          textStyle={styles.addTaskButtonText}
        /> */}
      </View>
    </View>
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="루틴 설정" showBackButton={true} />

      {isLoadingAI && ( // 로딩 스피너 오버레이
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
          <Text style={styles.loadingText}>오분이가 당신을 위한 루틴을 만들고 있어요!</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {/* 상위 목표 입력 필드 */}
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

        {/* 목표 달성 기간 설정 칸 */}
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

        {/* 맞춤일정 생성하기 버튼 */}
        <Button
          title="맞춤일정 생성하기"
          onPress={handleGenerateSchedule}
          style={styles.generateButton}
          disabled={isLoadingAI || !goal.trim()}
        />

        {/* AI가 추천하는 반복일정 칸 */}
        {aiRecommendedTasks.length > 0 && !isLoadingAI && (
          <View style={styles.aiRecommendationsContainer}>
            <Text style={styles.aiRecommendationsTitle}>오분이가 추천하는 반복일정</Text>
            {isContinuous ? (
              // 종료 기한 없이 지속 선택 시
              <FlatList
                data={aiRecommendedTasks}
                renderItem={renderAiTaskItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.aiFlatListContent}
              />
            ) : (
              // 달성 기간 설정 시 - 주차별 목표 및 일정
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

        {/* "테스크로 넘어감" 버튼 (AI 추천 목록이 있을 때만 표시) */}
        {aiRecommendedTasks.length > 0 && !isLoadingAI && (
          <Button
            title="테스크로 넘어감"
            onPress={handleProceedToTasks}
            primary={false}
            style={styles.proceedToTasksButton}
            disabled={isLoadingAI}
          />
        )}

        {/* 수정 모달 */}
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
  loadingOverlay: { // 로딩 스피너 오버레이
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
