// src/screens/HomeScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { format, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

import { GlobalStyles } from '../styles/GlobalStyles';
import { Colors } from '../styles/color';
import { FontSizes, FontWeights } from '../styles/Fonts';
import CharacterImage from '../components/common/CharacterImage';
import Button from '../components/common/Button';

// ObooniCustomizationScreen import path corrected based on user's file structure
import ObooniCustomizationScreen from '../screens/Obooni/ObooniCustomizationScreen';

// API 서비스 임포트
import { getCoinBalance } from '../services/coinApi';
import { getTasksByDate, completeTask as completeTaskApi } from '../services/taskApi';

const HomeScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [obooniState, setObooniState] = useState('default');

  const [coins, setCoins] = useState(0);
  const [showCoinGrantModal, setShowCoinGrantModal] = useState(false);
  const [showObooniCustomizationModal, setShowObooniCustomizationModal] = useState(false);

  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingCoins, setIsLoadingCoins] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);

  const fetchTasks = async (dateToFetch) => {
    setIsLoadingTasks(true);
    try {
      const formattedDate = format(new Date(dateToFetch), 'yyyy-MM-dd');
      const data = await getTasksByDate(formattedDate);
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks for date:", dateToFetch, error.response ? error.response.data : error.message);
      Alert.alert('오류', 'Task를 불러오는데 실패했습니다.');
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchCoinBalance = async () => {
    if (!isPremiumUser) {
      setCoins(0);
      return;
    }
    setIsLoadingCoins(true);
    try {
      const data = await getCoinBalance();
      setCoins(data.balance);
    } catch (error) {
      console.error("Failed to fetch coin balance:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '코인 잔액을 불러오는데 실패했습니다.');
      setCoins(0);
    } finally {
      setIsLoadingCoins(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchTasks(currentDate);
      fetchCoinBalance();
    }
  }, [isFocused, currentDate, isPremiumUser]);

  const goToPreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const toggleTaskCompletion = async (taskId) => {
    setIsCompletingTask(true);
    try {
      const response = await completeTaskApi(taskId);
      console.log("Task 완료 처리 성공:", response);

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, isCompleted: response.task.isCompleted, completedAt: response.task.completedAt } : task
        )
      );

      fetchCoinBalance();

      if (response.allTasksCompleted && isPremiumUser && response.coinReward && response.coinReward.amount > 0) {
        setShowCoinGrantModal(true);
      }

    } catch (error) {
      console.error("Task 완료 처리 실패:", error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || 'Task 완료 처리 중 문제가 발생했습니다.');
    } finally {
      setIsCompletingTask(false);
    }
  };

  const goToTaskDetail = (task) => {
    navigation.navigate('TaskDetailModal', {
      selectedDate: format(currentDate, 'yyyy-MM-dd'),
      initialTask: task,
      isPremiumUser: isPremiumUser,
      onTaskUpdate: () => fetchTasks(currentDate),
      onTaskDelete: () => fetchTasks(currentDate),
    });
  };

  const handleGoToTaskCalendar = () => {
    navigation.navigate('TaskCalendar');
  };

  const handleObooniPress = () => {
    navigation.navigate('ObooniCustomization', { isPremiumUser: isPremiumUser });
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => goToTaskDetail(item)}
      disabled={isCompletingTask}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTaskCompletion(item.id)}
        disabled={isCompletingTask}
      >
        <Text style={item.isCompleted ? styles.checkboxChecked : styles.checkboxUnchecked}>
          {item.isCompleted ? '✔' : '☐'}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.taskText, item.isCompleted && styles.taskTextCompleted]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <View style={styles.dateNavigationContainer}>
          <TouchableOpacity onPress={goToPreviousDay} style={styles.dateNavButton} disabled={isLoadingTasks || isCompletingTask}>
            <Text style={styles.dateNavButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.currentDateText}>
            {format(currentDate, 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
          </Text>
          <TouchableOpacity onPress={goToNextDay} style={styles.dateNavButton} disabled={isLoadingTasks || isCompletingTask}>
            <Text style={styles.dateNavButtonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {isPremiumUser && (
          <View style={styles.coinDisplayContainer}>
            {isLoadingCoins ? (
              <ActivityIndicator size="small" color={Colors.secondaryBrown} />
            ) : (
              <Text style={styles.coinText}>{coins}</Text>
            )}
            <FontAwesome name="dollar" size={FontSizes.medium} color={Colors.accentApricot} style={styles.coinIcon} />
          </View>
        )}

        <TouchableOpacity onPress={handleObooniPress} disabled={isLoadingTasks || isLoadingCoins || isCompletingTask}>
          <CharacterImage state={obooniState} style={styles.obooniCharacter} />
        </TouchableOpacity>

        <View style={styles.taskListContainer}>
          <Text style={styles.taskListTitle}>오늘의 할 일</Text>
          {isLoadingTasks || isCompletingTask ? (
            <ActivityIndicator size="large" color={Colors.secondaryBrown} style={styles.loadingIndicator} />
          ) : tasks.length > 0 ? (
            <FlatList
              data={tasks}
              renderItem={renderTaskItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.flatListContentContainer}
            />
          ) : (
            <TouchableOpacity onPress={handleGoToTaskCalendar} style={styles.noTaskContainer} disabled={isLoadingTasks || isCompletingTask}>
              <Text style={styles.noTaskText}>오늘의 일정을 정해주세요</Text>
              <FontAwesome name="plus-circle" size={30} color={Colors.secondaryBrown} style={styles.plusButton} />
            </TouchableOpacity>
          )}
        </View>

        {showCoinGrantModal && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={showCoinGrantModal}
            onRequestClose={() => setShowCoinGrantModal(false)}
          >
            <View style={styles.coinModalOverlay}>
              <View style={styles.coinModalContent}>
                <CharacterImage style={styles.modalObooni} />
                <Text style={styles.modalMessage}>
                  오분이가 뿌듯해합니다{"\n"}오늘도 화이팅 !
                </Text>
                <Button title="확인" onPress={() => setShowCoinGrantModal(false)} style={styles.modalButton} />
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  scrollViewContentContainer: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  dateNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    paddingVertical: 15,
    marginTop: 20,
  },
  dateNavButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  dateNavButtonText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.secondaryBrown,
  },
  currentDateText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
  },
  coinDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '90%',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  coinText: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginRight: 5,
  },
  coinIcon: {
    // 코인 아이콘 스타일 (FontAwesome)
  },
  obooniCharacter: {
    width: 250,
    height: 250,
    marginVertical: 20,
  },
  taskListContainer: {
    flex: 1,
    width: '90%',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskListTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 15,
  },
  flatList: {
    // FlatList 자체의 flexGrow를 제거하거나, scrollEnabled={false}로 부모 ScrollView가 스크롤을 담당하게 함
  },
  flatListContentContainer: {
    paddingBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryBeige,
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
  noTaskContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noTaskText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    marginBottom: 10,
  },
  plusButton: {
    // 플러스 버튼 스타일
  },
  coinModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  coinModalContent: {
    backgroundColor: Colors.textLight,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalObooni: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  modalButton: {
    width: '70%',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default HomeScreen;
