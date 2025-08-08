// src/screens/Analysis/MonthlyAnalysisView.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Image, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';
import CircularProgress from '../../components/common/CircularProgress';

// API 서비스 임포트
import { getMonthlyAnalysis } from '../../services/analysisApi';

// 캘린더 한국어 설정
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

// 캘린더 날짜를 '오분이' 이미지로 커스텀하기 위한 컴포넌트
const CustomDayComponent = ({ date, marking }) => {
  let imageSource;
  if (marking && marking.minutes > 0) {
    if (marking.minutes >= 120) { // 2시간 이상
      imageSource = require('../../../assets/images/obooni_happy.png');
    } else if (marking.minutes >= 60) { // 1시간 ~ 2시간
      imageSource = require('../../../assets/images/obooni_default.png');
    } else { // 1시간 미만
      imageSource = require('../../../assets/images/obooni_sad.png');
    }
  }

  return (
    <View style={styles.customDayContainer}>
      {imageSource ? (
        <Image source={imageSource} style={styles.obooniImage} />
      ) : (
        <Text style={[styles.dayText, marking?.isToday && styles.todayText]}>{date.day}</Text>
      )}
    </View>
  );
};

const MonthlyAnalysisView = ({ date, isPremiumUser }) => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [selectedDayActivities, setSelectedDayActivities] = useState(null);

  // 데이터 로드
  const fetchData = async (dateToFetch) => {
    setIsLoading(true);
    try {
      const year = dateToFetch.getFullYear();
      const month = dateToFetch.getMonth() + 1;
      const data = await getMonthlyAnalysis(year, month);
      setMonthlyData(data);
      // 데이터가 있고, AI 동의를 아직 하지 않은 경우 모달 표시 (실제 구현 시 AsyncStorage 등으로 동의 여부 저장 필요)
      if (data && data.stats && data.stats.totalFocusTime > 0) {
        // setIsAiModalVisible(true); // 필요시 주석 해제
      }
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

  // 월간 바 차트 데이터
  const getMonthlyBarChartData = () => {
    if (!monthlyData || !monthlyData.calendarHeatmap) return [];
    
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start, end });
  
    let filteredData = daysInMonth.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const dayData = monthlyData.calendarHeatmap[dayString] || { minutes: 0, activities: [] };
      return { date: day, ...dayData };
    });
  
    if (activeFilter !== '전체') {
      filteredData = filteredData.map(data => {
        const filteredActivities = data.activities.filter(act => act.goal === activeFilter);
        const totalMinutes = filteredActivities.reduce((sum, act) => sum + act.minutes, 0);
        return { ...data, minutes: totalMinutes, activities: filteredActivities };
      });
    }
  
    return filteredData;
  };

  // 월간 달력 UI를 위한 데이터 가공
  const getMarkedDatesForCalendar = () => {
    const marked = {};
    if (!monthlyData || !monthlyData.calendarHeatmap) return marked;

    Object.keys(monthlyData.calendarHeatmap).forEach(dayString => {
      const minutes = monthlyData.calendarHeatmap[dayString].minutes;
      marked[dayString] = { minutes: minutes, customStyles: { container: { backgroundColor: 'transparent' } } };
    });
    return marked;
  };
  
  // AI 동의 모달 UI
  const renderAiConsentModal = () => (
      <Modal
          animationType="fade"
          transparent={true}
          visible={isAiModalVisible}
          onRequestClose={() => setIsAiModalVisible(false)}
      >
          <View style={styles.modalContainer}>
              <View style={styles.aiModalContent}>
                  <Text style={styles.aiModalText}>
                      오분이가 AI와 함께 당신의 집중시간을 파악해 패턴을 확인해도 될까요?
                  </Text>
                  <View style={styles.aiModalButtons}>
                      <TouchableOpacity style={styles.aiModalButton} onPress={() => { /* 동의 API 호출 */ setIsAiModalVisible(false); }}>
                          <Text style={styles.aiModalButtonText}>네</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.aiModalButton, styles.aiModalButtonDecline]} onPress={() => setIsAiModalVisible(false)}>
                          <Text style={styles.aiModalButtonText}>아니오</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondaryBrown} />
        <Text style={styles.loadingText}>월간 분석 데이터 로딩 중...</Text>
      </View>
    );
  }

  if (!monthlyData || !monthlyData.stats || monthlyData.stats.totalFocusTime === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>해당 월간에 분석 데이터가 없습니다.</Text>
      </View>
    );
  }

  const { stats, monthlyData: monthlyGoalStats, calendarHeatmap } = monthlyData;
  const filterButtons = ['전체', ...new Set(Object.values(calendarHeatmap).flatMap(d => d.activities.map(a => a.goal)))];

  return (
    <View style={styles.container}>
      {renderAiConsentModal()}

      {/* 월간 집중 분야 분석 (12번) */}
      <Text style={styles.sectionTitle}>월간 집중 분야 분석</Text>
      <View style={styles.monthlyActivitiesContainer}>
        {monthlyGoalStats && monthlyGoalStats.length > 0 ? (
          monthlyGoalStats.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityColorIndicator, { backgroundColor: activity.color || Colors.secondaryBrown }]} />
              <Text style={styles.activityName}>{activity.goal}</Text>
              <Text style={styles.activityTime}>{activity.totalTime}분</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>월간 집중 분야 기록이 없습니다.</Text>
        )}
      </View>

      {/* 월간 바 차트 + 필터링 UI (13번) */}
      <Text style={styles.sectionTitle}>일별 집중 시간 추이</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
        {filterButtons.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
                  height: `${(data.minutes / 300) * 100 > 100 ? 100 : (data.minutes / 300) * 100}%`, // 300분(5시간) 기준
                  backgroundColor: data.activities.length > 0 ? data.activities[0].color : Colors.secondaryBrown,
                }
              ]} />
              <Text style={styles.barLabel}>{format(data.date, 'dd')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* 월간 달력 UI (16번) */}
      <Text style={styles.sectionTitle}>월간 집중량 달력</Text>
      <Calendar
        dayComponent={CustomDayComponent}
        markingType={'custom'}
        markedDates={getMarkedDatesForCalendar()}
        theme={{
          backgroundColor: Colors.primaryBeige,
          calendarBackground: Colors.textLight,
          textSectionTitleColor: Colors.secondaryBrown,
          todayTextColor: Colors.accentApricot,
          dayTextColor: Colors.textDark,
          textDisabledColor: Colors.gray,
          arrowColor: Colors.secondaryBrown,
          monthTextColor: Colors.textDark,
          textMonthFontWeight: FontWeights.bold,
          textMonthFontSize: FontSizes.large,
          textDayHeaderFontWeight: FontWeights.medium,
        }}
        style={styles.calendar}
      />

      {/* 월간 집중도 통계 (14번) */}
      <Text style={styles.sectionTitle}>월간 집중도 통계</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 집중 시간</Text>
          <Text style={styles.statValue}>{Math.floor(stats.totalFocusTime / 60)}시간 {stats.totalFocusTime % 60}분</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>평균 집중 시간</Text>
          <Text style={styles.statValue}>{stats.averageFocusTime}분</Text>
        </View>
      </View>

      {/* 집중 비율 (15번) */}
      <Text style={styles.sectionTitle}>집중 비율</Text>
      <View style={[styles.statsContainer, { alignItems: 'center' }]}>
        <CircularProgress
          size={120}
          strokeWidth={12}
          progress={stats.concentrationRatio || 0}
          text={`${stats.concentrationRatio || 0}%`}
        />
        <View style={styles.ratioDetails}>
            <View style={styles.ratioDetailItem}>
                <Text style={styles.statLabel}>집중 시간</Text>
                <Text style={styles.statValue}>{Math.floor(stats.totalFocusTime / 60)}시간 {stats.totalFocusTime % 60}분</Text>
            </View>
            <View style={styles.ratioDetailItem}>
                <Text style={styles.statLabel}>휴식 시간</Text>
                <Text style={styles.statValue}>{Math.floor(stats.totalBreakTime / 60)}시간 {stats.totalBreakTime % 60}분</Text>
            </View>
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
  monthlyActivitiesContainer: {
    width: '90%',
    alignSelf: 'center',
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
  filterScrollView: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.textLight,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.primaryBeige,
  },
  filterButtonActive: {
    backgroundColor: Colors.accentApricot,
    borderColor: Colors.accentApricot,
  },
  filterText: {
    color: Colors.secondaryBrown,
    fontWeight: FontWeights.medium,
  },
  filterTextActive: {
    color: Colors.textLight,
    fontWeight: FontWeights.bold,
  },
  barChartScrollView: {
    width: '100%',
    height: 250,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 25,
    paddingHorizontal: 5,
  },
  barColumn: {
    width: 20,
    marginHorizontal: 3,
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
    position: 'absolute',
    bottom: 0,
  },
  calendar: {
    width: '90%',
    alignSelf: 'center',
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
  customDayContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  obooniImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  dayText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  todayText: {
    fontWeight: FontWeights.bold,
    color: Colors.accentApricot,
  },
  statsContainer: {
    width: '90%',
    alignSelf: 'center',
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
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    fontWeight: FontWeights.medium,
  },
  statValue: {
    fontSize: FontSizes.large,
    color: Colors.secondaryBrown,
    fontWeight: FontWeights.bold,
  },
  ratioDetails: {
      width: '100%',
      marginTop: 20,
  },
  ratioDetailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: Colors.primaryBeige,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  aiModalContent: {
      width: '80%',
      backgroundColor: Colors.textLight,
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
  },
  aiModalText: {
      fontSize: FontSizes.medium,
      fontWeight: FontWeights.medium,
      textAlign: 'center',
      color: Colors.textDark,
      lineHeight: 22,
      marginBottom: 20,
  },
  aiModalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
  },
  aiModalButton: {
      flex: 1,
      padding: 10,
      marginHorizontal: 5,
      backgroundColor: Colors.accentApricot,
      borderRadius: 10,
      alignItems: 'center',
  },
  aiModalButtonDecline: {
      backgroundColor: Colors.secondaryBrown,
  },
  aiModalButtonText: {
      color: Colors.textLight,
      fontWeight: FontWeights.bold,
  },
});

export default MonthlyAnalysisView;