// src/screens/Task/TaskDetailModal.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';

// TaskEditModal, TaskDeleteConfirmModal 임포트
import TaskEditModal from './TaskEditModal';
import TaskDeleteConfirmModal from './TaskDeleteConfirmModal';
import TaskCompleteCoinModal from './TaskCompleteCoinModal'; // 코인 지급 모달 임포트

// API 서비스 임포트
import { completeTask, deleteTask } from '../../services/taskApi';

const TaskDetailModal = ({ selectedDate, tasks: initialTasks, onClose, isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const [tasks, setTasks] = useState(initialTasks); // Task 목록을 내부 상태로 관리
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editMode, setEditMode] = useState('add');
  const [currentEditingTask, setCurrentEditingTask] = useState(null);

  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [showCoinModal, setShowCoinModal] = useState(false); // 코인 지급 모달 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // Task 완료 체크 토글 (API 연동)
  const toggleTaskCompletion = async (taskId) => {
    setIsLoading(true);
    try {
      const response = await completeTask(taskId); // API 호출
      console.log("Task 완료 처리 성공:", response);
      // UI 업데이트
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);

      // 모든 Task 완료 여부 확인 후 코인 지급 모달 띄우기
      const allCompleted = updatedTasks.every(task => task.completed);
      if (allCompleted && updatedTasks.length > 0 && isPremiumUser) { // 유료 사용자에게만 지급
        setShowCoinModal(true);
        // 실제로는 백엔드 코인 지급 API 호출 (Postman 2-3 코인 적립)
        // await earnCoinApi({ source: 'task_completion', amount: 1, description: '하루 Task 완료' });
      }

    } catch (error) {
      console.error("Task 완료 처리 실패:", error.response ? error.response.data : error.message);
      Alert.alert('오류', 'Task 완료 처리 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Task 추가 버튼 클릭
  const handleAddTask = () => {
    setEditMode('add');
    setCurrentEditingTask(null);
    setIsEditModalVisible(true);
  };

  // Task 수정 아이콘 클릭
  const handleEditTask = (task) => {
    setEditMode('edit');
    setCurrentEditingTask(task);
    setIsEditModalVisible(true);
  };

  // Task 삭제 아이콘 클릭
  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteConfirmModalVisible(true);
  };

  // Task 삭제 확인 모달에서 '예' 클릭 시 (API 연동)
  const onConfirmDelete = async (deleteFutureTasks) => {
    setIsLoading(true);
    try {
      await deleteTask(taskToDelete.id); // API 호출
      console.log("Task 삭제 성공:", taskToDelete.id);
      Alert.alert('Task 삭제', `"${taskToDelete.text}" Task가 삭제되었습니다.`);
      // UI에서 삭제
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      
      setIsDeleteConfirmModalVisible(false);
      setTaskToDelete(null);
      onClose(); // 모달 닫기 (TaskCalendarScreen에서 목록 갱신을 위해)
    } catch (error) {
      console.error("Task 삭제 실패:", error.response ? error.response.data : error.message);
      Alert.alert('오류', 'Task 삭제 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Task 삭제 확인 모달에서 '아니오' 클릭 시
  const onCancelDelete = () => {
    setIsDeleteConfirmModalVisible(false);
    setTaskToDelete(null);
  };

  // TaskEditModal에서 저장 완료 시 (API 연동)
  const onTaskEditSave = async (updatedTask) => {
    setIsLoading(true);
    try {
      let response;
      if (editMode === 'add') {
        response = await createTask({ ...updatedTask, date: selectedDate }); // API 호출 (날짜 추가)
        console.log("Task 생성 성공:", response);
        Alert.alert('Task 추가', `"${updatedTask.text}" Task가 추가되었습니다.`);
      } else {
        response = await updateTask(updatedTask.id, updatedTask); // API 호출
        console.log("Task 수정 성공:", response);
        Alert.alert('Task 수정', `"${updatedTask.text}" Task가 수정되었습니다.`);
      }
      setIsEditModalVisible(false);
      onClose(); // 모달 닫기 (TaskCalendarScreen에서 목록 갱신을 위해)
    } catch (error) {
      console.error(`Task ${editMode === 'add' ? '생성' : '수정'} 실패:`, error.response ? error.response.data : error.message);
      Alert.alert('오류', `Task ${editMode === 'add' ? '생성' : '수정'} 중 문제가 발생했습니다.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Task 항목 렌더링
  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTaskCompletion(item.id)}
        disabled={isLoading} // 로딩 중에는 클릭 비활성화
      >
        <Text style={item.completed ? styles.checkboxChecked : styles.checkboxUnchecked}>
          {item.completed ? '✔' : '☐'}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
        {item.title} {/* API 명세에 따라 'title' 사용 */}
      </Text>
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => handleEditTask(item)} style={styles.actionIcon} disabled={isLoading}>
          <FontAwesome5 name="pen" size={18} color={Colors.secondaryBrown} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTask(item)} style={styles.actionIcon} disabled={isLoading}>
          <FontAwesome5 name="trash-alt" size={18} color={Colors.secondaryBrown} />
        </TouchableOpacity>
      </View>
      {item.category && ( // 카테고리 정보가 있다면 표시
        <View style={[styles.categoryTag, { backgroundColor: item.category.color || Colors.primaryBeige }]}>
          <Text style={styles.categoryText}>{item.category.name}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        {isLoading && ( // 로딩 스피너 표시
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.accentApricot} />
          </View>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={isLoading}>
          <FontAwesome5 name="times" size={24} color={Colors.secondaryBrown} />
        </TouchableOpacity>

        <Text style={styles.modalDate}>{format(new Date(selectedDate), 'yyyy년 MM월 dd일')}</Text>

        {tasks.length > 0 ? (
          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.taskListContent}
          />
        ) : (
          <View style={styles.noTaskContainer}>
            <Text style={styles.noTaskText}>할 일이 없습니다.</Text>
          </View>
        )}

        {/* 할 일 추가 버튼 */}
        <View style={styles.addTaskInputContainer}>
          <TextInput
            style={styles.addTaskInput}
            placeholder="새로운 할 일을 입력하세요"
            placeholderTextColor={Colors.secondaryBrown}
            editable={false}
          />
          <TouchableOpacity style={styles.addTaskButton} onPress={handleAddTask} disabled={isLoading}>
            <FontAwesome5 name="plus" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Task 추가/수정 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TaskEditModal
          mode={editMode}
          initialTask={currentEditingTask}
          onSave={onTaskEditSave}
          onClose={() => setIsEditModalVisible(false)}
          isPremiumUser={isPremiumUser} // isPremiumUser 전달
        />
      </Modal>

      {/* Task 삭제 확인 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteConfirmModalVisible}
        onRequestClose={onCancelDelete}
      >
        <TaskDeleteConfirmModal
          task={taskToDelete}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
          isPremiumUser={isPremiumUser} // isPremiumUser 전달
        />
      </Modal>

      {/* Task 완료 코인 지급 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCoinModal}
        onRequestClose={() => setShowCoinModal(false)}
      >
        <TaskCompleteCoinModal onClose={() => setShowCoinModal(false)} isPremiumUser={isPremiumUser} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: Colors.textLight,
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
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
    borderRadius: 20,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  modalDate: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  taskListContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.secondaryBrown,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: Colors.textLight,
  },
  checkboxChecked: {
    color: Colors.accentApricot,
    fontSize: 18,
  },
  checkboxUnchecked: {
    color: 'transparent',
    fontSize: 18,
  },
  taskText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.secondaryBrown,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionIcon: {
    padding: 5,
    marginLeft: 10,
  },
  categoryTag: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: FontSizes.small - 2,
    color: Colors.textLight,
    fontWeight: FontWeights.medium,
  },
  noTaskContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noTaskText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
  },
  addTaskInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    paddingRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addTaskInput: {
    flex: 1,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  addTaskButton: {
    backgroundColor: Colors.accentApricot,
    borderRadius: 8,
    padding: 10,
  },
});

export default TaskDetailModal;
