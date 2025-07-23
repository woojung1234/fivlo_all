// src/screens/Task/TaskCalendarScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // useIsFocused 임포트
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';

// TaskDetailModal 임포트
import TaskDetailModal from './TaskDetailModal';

// API 서비스 임포트
import { getTasksByDate } from '../../services/taskApi';

// react-native-calendars 설치 필요: npm install react-native-calendars

// 캘린더 한국어 설정
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const TaskCalendarScreen = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused(); // 화면 포커스 여부

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({}); // 캘린더에 표시될 날짜들

  // Task 목록 로드
  const fetchTasks = async (dateToFetch) => {
    setIsLoading(true);
    try {
      const formattedDate = format(new Date(dateToFetch), 'yyyy-MM-dd');
      const data = await getTasksByDate(formattedDate); // API 호출
      setTasksForSelectedDate(data);

      // 캘린더 markedDates 업데이트 (모든 Task를 가져와서 표시하는 방식은 복잡하므로, 현재 월의 Task만 표시)
      // 실제 앱에서는 월별 Task를 미리 로드하여 markedDates를 구성하는 것이 효율적
      const newMarkedDates = {
        [formattedDate]: {
          selected: true,
          selectedColor: Colors.accentApricot,
          dots: data.map(task => ({
            key: task.id,
            color: task.category?.color || Colors.secondaryBrown, // 카테고리 색상 사용
            selectedDotColor: Colors.textLight,
          })),
        },
      };
      setMarkedDates(newMarkedDates);

    } catch (error) {
      console.error("Failed to fetch tasks for date:", dateToFetch, error);
      Alert.alert('오류', 'Task를 불러오는데 실패했습니다.');
      setTasksForSelectedDate([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 포커스 시 또는 날짜 변경 시 Task 로드
  useEffect(() => {
    if (isFocused) { // 화면이 포커스될 때마다 Task를 다시 불러옴 (Task 추가/수정/삭제 후 반영)
      fetchTasks(selectedDate);
    }
  }, [isFocused, selectedDate]); // selectedDate 변경 시에도 다시 불러옴

  // 캘린더 날짜 클릭 핸들러
  const onDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString); // 선택된 날짜 업데이트 (useEffect에 의해 Task 다시 로드)
    setIsModalVisible(true); // 모달 열기
  };

  // 모달에서 Task가 업데이트/삭제되었을 때 캘린더를 새로고침하는 콜백
  const onTaskModalClosed = () => {
    setIsModalVisible(false);
    fetchTasks(selectedDate); // 현재 선택된 날짜의 Task를 다시 불러옴
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="TASK" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.secondaryBrown} style={styles.loadingIndicator} />
        ) : (
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType={'dots'}
            theme={{
              backgroundColor: Colors.primaryBeige,
              calendarBackground: Colors.primaryBeige,
              textSectionTitleColor: Colors.secondaryBrown,
              selectedDayBackgroundColor: Colors.accentApricot,
              selectedDayTextColor: Colors.textLight,
              todayTextColor: Colors.accentApricot,
              dayTextColor: Colors.textDark,
              textDisabledColor: '#d9e1e8',
              dotColor: Colors.accentApricot,
              selectedDotColor: Colors.textLight,
              arrowColor: Colors.secondaryBrown,
              monthTextColor: Colors.textDark,
              textMonthFontWeight: FontWeights.bold,
              textMonthFontSize: FontSizes.large,
              textDayHeaderFontWeight: FontWeights.medium,
              textDayFontSize: FontSizes.medium,
              textDayFontWeight: FontWeights.regular,
            }}
            style={styles.calendar}
          />
        )}
      </ScrollView>

      {/* Task 상세/입력 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={onTaskModalClosed} // 모달 닫기 요청 시 콜백
      >
        <TaskDetailModal
          selectedDate={selectedDate}
          tasks={tasksForSelectedDate}
          onClose={onTaskModalClosed} // 모달 닫기 콜백 전달
          isPremiumUser={isPremiumUser} // isPremiumUser 전달
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 40,
    alignItems: 'center',
    paddingTop: 10,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  calendar: {
    width: '100%',
    aspectRatio: 1,
    padding: 10,
    borderRadius: 15,
    backgroundColor: Colors.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default TaskCalendarScreen;
