// src/screens/HomeScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ScrollView, Modal, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation, useIsFocused } from '@react-navigation/native'; // useIsFocused 임포트 추가
import { format, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

import { GlobalStyles } from '../styles/GlobalStyles';
import { Colors } from '../styles/color';
import { FontSizes, FontWeights } from '../styles/Fonts';
import CharacterImage from '../components/common/CharacterImage';
import Button from '../components/common/Button';

import ObooniCustomizationScreen from '../screens/Obooni/ObooniCustomizationScreen';

// API 서비스 임포트
import { getCoinBalance } from '../services/coinApi'; // coinApi 임포트
import { getTasksByDate } from '../services/taskApi'; // Task API 임포트 (날짜별 Task 로딩용)

const HomeScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused(); // 화면 포커스 여부

  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [obooniState, setObooniState] = useState('default');

  const [coins, setCoins] = useState(0); // 초기 코인 0으로 설정
  const [showCoinGrantModal, setShowCoinGrantModal] = useState(false);
  const [showObooniCustomizationModal, setShowObooniCustomizationModal] = useState(false);

  const [isLoadingTasks, setIsLoadingTasks] = useState(false); // Task 로딩 상태
  const [isLoadingCoins, setIsLoadingCoins] = useState(false); // 코인 로딩 상태

  // Task 목록 로드
  const fetchTasks = async (dateToFetch) => {
    setIsLoadingTasks(true);
    try {
      const formattedDate = format(new Date(dateToFetch), 'yyyy-MM-dd');
      const data = await getTasksByDate(formattedDate); // API 호출
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks for date:", dateToFetch, error);
      Alert.alert('오류', 'Task를 불러오는데 실패했습니다.');
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // 코인 잔액 로드
  const fetchCoinBalance = async () => {
    if (!isPremiumUser) { // 무료 사용자면 코인 조회 안 함
      setCoins(0);
      return;
    }
    setIsLoadingCoins(true);
    try {
      const data = await getCoinBalance(); // API 호출
      setCoins(data.balance);
    } catch (error) {
      console.error("Failed to fetch coin balance:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '코인 잔액을 불러오는데 실패했습니다.');
      setCoins(0);
    } finally {
      setIsLoadingCoins(false);
    }
  };

  // 화면 포커스 시 Task 및 코인 로드
  useEffect(() => {
    if (isFocused) {
      fetchTasks(currentDate);
      fetchCoinBalance();
    }
  }, [isFocused, currentDate, isPremiumUser]); // isPremiumUser 변경 시에도 코인 로드

  const goToPreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const toggleTaskCompletion = (id) => {
    // TaskDetailModal에서 완료 처리 API 호출하므로, 여기서는 UI만 업데이트
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const goToTaskDetail = (task) => {
    // TaskDetailModal로 이동 (TaskDetailModal에서 Task 완료 처리 API 호출)
    navigation.navigate('TaskDetailModal', { selectedDate: format(currentDate, 'yyyy-MM-dd'), tasks: tasks, initialTask: task });
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
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTaskCompletion(item.id)}
      >
        <Text style={item.completed ? styles.checkboxChecked : styles.checkboxUnchecked}>
          {item.completed ? '✔' : '☐'}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <View style={styles.dateNavigationContainer}>
          <TouchableOpacity onPress={goToPreviousDay} style={styles.dateNavButton}>
            <Text style={styles.dateNavButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.currentDateText}>
            {format(currentDate, 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
          </Text>
          <TouchableOpacity onPress={goToNextDay} style={styles.dateNavButton}>
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

        <TouchableOpacity onPress={handleObooniPress}>
          <CharacterImage state={obooniState} style={styles.obooniCharacter} />
        </TouchableOpacity>

        <View style={styles.taskListContainer}>
          <Text style={styles.taskListTitle}>오늘의 할 일</Text>
          {isLoadingTasks ? (
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
            <TouchableOpacity onPress={handleGoToTaskCalendar} style={styles.noTaskContainer}>
              <Text style={styles.noTaskText}>오늘의 일정을 정해주세요</Text>
              <FontAwesome name="plus-circle" size={30} color={Colors.secondaryBrown} style={styles.plusButton} />
            </TouchableOpacity>
          )}
        </View>

        {showCoinGrantModal && (
          <View style={styles.coinModalOverlay}>
            <View style={styles.coinModalContent}>
              <CharacterImage style={styles.modalObooni} />
              <Text style={styles.modalMessage}>
                오분이가 뿌듯해합니다{"\n"}오늘도 화이팅 !
              </Text>
              <Button title="확인" onPress={() => setShowCoinGrantModal(false)} style={styles.modalButton} />
            </View>
          </View>
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
