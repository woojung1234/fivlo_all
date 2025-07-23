// src/screens/Task/TaskCalendarScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';

// TaskDetailModal 임포트
import TaskDetailModal from './TaskDetailModal';

// API 서비스 임포트
import { getTasksByDate, getGrowthAlbumCalendar as getCalendarMonthlyData } from '../../services/taskApi';

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

const TaskCalendarScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [currentMonth, setCurrentMonth] = useState(new Date()); // 현재 캘린더에 표시되는 월
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  // 월별 캘린더 데이터 (Task 표시용) 로드
  const fetchMonthlyCalendarData = async (year, month) => {
    setIsLoading(true);
    try {
      const data = await getCalendarMonthlyData(year, month);
      
      const newMarkedDates = {};
      data.forEach(albumItem => {
        const dateStr = format(new Date(albumItem.capturedAt), 'yyyy-MM-dd'); // <-- albumItem.date 대신 albumItem.capturedAt 사용
        if (!newMarkedDates[dateStr]) {
          newMarkedDates[dateStr] = { dots: [] };
        }
        newMarkedDates[dateStr].dots.push({
          key: albumItem.id,
          color: albumItem.category?.color || Colors.accentApricot,
          selectedDotColor: Colors.textLight,
        });
      });
      if (selectedDate && newMarkedDates[selectedDate]) {
        newMarkedDates[selectedDate].selected = true;
        newMarkedDates[selectedDate].selectedColor = Colors.accentApricot;
      } else if (selectedDate) {
        newMarkedDates[selectedDate] = { selected: true, selectedColor: Colors.accentApricot };
      }

      setMarkedDates(newMarkedDates);
      
    } catch (error) {
      console.error("Failed to fetch monthly calendar data:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '캘린더 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Task 목록 로드 (선택된 날짜 기준)
  const fetchTasksForSelectedDate = async (dateToFetch) => {
    setIsLoading(true);
    try {
      const formattedDate = format(new Date(dateToFetch), 'yyyy-MM-dd');
      const data = await getTasksByDate(formattedDate);
      setTasksForSelectedDate(data);
    } catch (error) {
      console.error("Failed to fetch tasks for date:", dateToFetch, error.response ? error.response.data : error.message);
      Alert.alert('오류', 'Task를 불러오는데 실패했습니다.');
      setTasksForSelectedDate([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 포커스 시 현재 월의 캘린더 데이터 로드
  useEffect(() => {
    if (isFocused) {
      const today = new Date();
      fetchMonthlyCalendarData(today.getFullYear(), today.getMonth() + 1);
      fetchTasksForSelectedDate(selectedDate);
    }
  }, [isFocused]);

  // 캘린더 날짜 클릭 핸들러
  const onDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    navigation.navigate('TaskDetailModal', { 
      selectedDate: dateString, 
      // tasks: tasksForSelectedDate, // TaskDetailModal에서 자체적으로 Task를 다시 불러오도록 변경
      isPremiumUser: isPremiumUser,
      onTaskUpdate: () => fetchTasksForSelectedDate(dateString),
      onTaskDelete: () => fetchTasksForSelectedDate(dateString),
    });
  };

  // 캘린더 월 변경 핸들러
  const onMonthChange = (month) => {
    setCurrentMonth(new Date(month.year, month.month - 1, 1));
    fetchMonthlyCalendarData(month.year, month.month);
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="TASK" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {isLoading && (
          <ActivityIndicator size="large" color={Colors.secondaryBrown} style={styles.loadingIndicator} />
        )}
        <Calendar
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
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
          enableSwipeMonths={true}
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
