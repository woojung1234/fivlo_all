// src/screens/Analysis/MonthlyAnalysisView.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';

// API 서비스 임포트
import { getMonthlyAnalysis } from '../../services/analysisApi';

// 캘린더 한국어 설정 (TaskCalendarScreen과 동일)
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const MonthlyAnalysisView = ({ date, isPremiumUser }) => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDayActivities, setSelectedDayActivities] = useState(null);

  // 데이터 로드
  const fetchData = async (dateToFetch) => {
    setIsLoading(true);
    try {
      const year = dateToFetch.getFullYear();
      const month = dateToFetch.getMonth() + 1; // 월은 0부터 시작하므로 +1
      const data = await getMonthlyAnalysis(year, month); // API 호출
      setMonthlyData(data);
    } catch (error) {
      console.error("Failed to fetch monthly analysis data:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '월간 분석 데이터를 불러오는데 실패했습니다.');
      setMonthlyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // date prop이 변경될 때마다 데이터 로드
  useEffect(() => {
    fetchData(date);
  }, [date]);

  // 월간 바 차트 데이터 (13번)
  const getMonthlyBarChartData = () => {
    if (!monthlyData || !monthlyData.dailyConcentration) return [];

    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start, end });

    return daysInMonth.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const minutes = monthlyData.dailyConcentration[dayString]?.minutes || 0;
      const activities = monthlyData.dailyConcentration[dayString]?.activities || [];
      return { date: day, minutes, activities };
    });
  };

  // 월간 달력 UI (16번)
  const getMarkedDatesForCalendar = () => {
    const marked = {};
    if (!monthlyData || !monthlyData.dailyConcentration) return marked;

    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start, end });

    daysInMonth.forEach(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const minutes = monthlyData.dailyConcentration[dayString]?.minutes || 0;
      let backgroundColor = Colors.textLight;
      let textColor = Colors.textDark;

      if (minutes > 0) {
        if (minutes < 60) {
          backgroundColor = '#F5E6CC';
          textColor = Colors.secondaryBrown;
        } else if (minutes >= 60 && minutes < 120) {
          backgroundColor = '#D4B88C';
          textColor = Colors.textLight;
        } else {
          backgroundColor = '#A87C6F';
          textColor = Colors.textLight;
        }
      }

      marked[dayString] = {
        customStyles: {
          container: {
            backgroundColor: backgroundColor,
            borderRadius: 5,
          },
          text: {
            color: textColor,
          },
        },
      };
    });
    return marked;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondaryBrown} />
        <Text style={styles.loadingText}>월간 분석 데이터 로딩 중...</Text>
      </View>
    );
  }

  if (!monthlyData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>해당 월간에 분석 데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 월간 집중 분야 분석 (12번) */}
      <Text style={styles.sectionTitle}>월간 집중 분야 분석</Text>
      <View style={styles.monthlyActivitiesContainer}>
        {monthlyData.monthlyActivities && monthlyData.monthlyActivities.length > 0 ? (
          monthlyData.monthlyActivities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityColorIndicator, { backgroundColor: activity.color || Colors.secondaryBrown }]} />
              <Text style={styles.activityName}>{activity.name}</Text>
              <Text style={styles.activityTime}>{activity.totalTime}분</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>월간 집중 분야 기록이 없습니다.</Text>
        )}
      </View>

      {/* 월간 바 차트 (13번) */}
      <Text style={styles.sectionTitle}>일별 집중 시간 추이</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.barChartScrollView}>
        <View style={styles.barChartContainer}>
          {getMonthlyBarChartData().map((data, index) => (
            <TouchableOpacity
              key={index}
              style={styles.barColumn}
              onPress={() => setSelectedDayActivities(data.activities)}
            >
              <View style={[
                styles.bar,
                {
                  height: `${(data.minutes / 300) * 100}%`, // 300분(5시간) 기준
                  backgroundColor: data.activities.length > 0 ? data.activities[0].color : Colors.secondaryBrown,
                }
              ]} />
              <Text style={styles.barLabel}>{format(data.date, 'dd')}</Text>
            </TouchableOpacity>
          ))}
          {/* 기준선 표시 (Y축 눈금) */}
          <View style={styles.yAxisLabels}>
            <Text style={styles.yAxisLabel}>300분</Text>
            <Text style={styles.yAxisLabel}>240분</Text>
            <Text style={styles.yAxisLabel}>180분</Text>
            <Text style={styles.yAxisLabel}>120분</Text>
            <Text style={styles.yAxisLabel}>60분</Text>
            <Text style={styles.yAxisLabel}>0분</Text>
          </View>
        </View>
      </ScrollView>
      {selectedDayActivities && selectedDayActivities.length > 0 && (
        <View style={styles.selectedDayActivitiesContainer}>
          <Text style={styles.selectedDayActivitiesTitle}>선택된 날짜 활동</Text>
          {selectedDayActivities.map((activity, index) => (
            <Text key={index} style={styles.selectedDayActivityText}>
              - {activity.name} ({activity.minutes}분)
            </Text>
          ))}
        </View>
      )}

      {/* 월간 달력 UI (16번) */}
      <Text style={styles.sectionTitle}>월간 집중량 달력</Text>
      <Calendar
        markingType={'custom'}
        markedDates={getMarkedDatesForCalendar()}
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

      {/* 월간 집중도 통계 (14번) */}
      <Text style={styles.sectionTitle}>월간 집중도 통계</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 집중 시간</Text>
          <Text style={styles.statValue}>{monthlyData.totalConcentrationTime || 0}분</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>평균 집중 시간</Text>
          <Text style={styles.statValue}>{monthlyData.averageConcentrationTime || 0}분</Text>
        </View>
      </View>

      {/* 집중 비율 (15번) */}
      <Text style={styles.sectionTitle}>집중 비율</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>집중 시간과 휴식 시간 비율</Text>
          <Text style={styles.statValue}>{monthlyData.concentrationRatio || 0}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>집중 시간</Text>
          <Text style={styles.statValue}>{monthlyData.focusTime || 0}분</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>휴식 시간</Text>
          <Text style={styles.statValue}>{monthlyData.breakTime || 0}분</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    marginTop: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noDataText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginTop: 25,
    marginBottom: 15,
    width: '100%',
    textAlign: 'left',
    paddingLeft: 20,
  },
  // 월간 집중 분야 분석 스타일
  monthlyActivitiesContainer: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityColorIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  activityName: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    flex: 1,
  },
  activityTime: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    fontWeight: FontWeights.bold,
  },
  barChartScrollView: {
    width: '100%',
    height: 250,
    paddingHorizontal: 10,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 10,
    paddingHorizontal: 5,
    position: 'relative',
  },
  barColumn: {
    width: 20,
    marginHorizontal: 2,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 3,
  },
  barLabel: {
    fontSize: FontSizes.small - 2,
    color: Colors.secondaryBrown,
    marginTop: 5,
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingRight: 5,
    alignItems: 'flex-end',
  },
  yAxisLabel: {
    fontSize: FontSizes.small - 2,
    color: Colors.secondaryBrown,
  },
  selectedDayActivitiesContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDayActivitiesTitle: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 10,
  },
  selectedDayActivityText: {
    fontSize: FontSizes.small,
    color: Colors.textDark,
    marginBottom: 5,
  },
  calendar: {
    width: '100%',
    padding: 10,
    borderRadius: 15,
    backgroundColor: Colors.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  statsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    fontWeight: FontWeights.medium,
  },
  statValue: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    fontWeight: FontWeights.bold,
  },
});

export default MonthlyAnalysisView;
