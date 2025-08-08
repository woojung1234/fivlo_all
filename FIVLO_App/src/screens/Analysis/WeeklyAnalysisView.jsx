// src/screens/Analysis/WeeklyAnalysisView.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { format, getWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import CircularProgress from '../../components/common/CircularProgress';

// API 서비스 임포트
import { getWeeklyAnalysis } from '../../services/analysisApi';

const WeeklyAnalysisView = ({ date, isPremiumUser }) => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 로드
  const fetchData = async (dateToFetch) => {
    setIsLoading(true);
    try {
      const year = format(dateToFetch, 'yyyy');
      const weekNumber = getWeek(dateToFetch, { weekStartsOn: 1 }); // 월요일이 주의 시작
      const weekString = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

      const data = await getWeeklyAnalysis(weekString); // API 호출
      setWeeklyData(data);
    } catch (error) {
      console.error("Failed to fetch weekly analysis data:", error.response ? error.response.data : error.message);
      // API 호출 실패 시 weeklyData를 null로 설정하여 '데이터 없음' 화면이 표시되도록 함
      setWeeklyData(null); 
      Alert.alert('오류', '주간 분석 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // date prop이 변경될 때마다 데이터 로드
  useEffect(() => {
    fetchData(date);
  }, [date]);

  const daysOfWeekShort = ['일', '월', '화', '수', '목', '금', '토'];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondaryBrown} />
        <Text style={styles.loadingText}>주간 분석 데이터 로딩 중...</Text>
      </View>
    );
  }

  // [오류 수정] weeklyData가 null이거나, 내부에 stats 객체가 없을 경우를 모두 확인하여 앱 충돌 방지
  if (!weeklyData || !weeklyData.stats) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>해당 주간에 분석 데이터가 없습니다.</Text>
      </View>
    );
  }

  // 데이터가 정상적으로 있을 때만 아래 코드가 실행됨
  const { stats, weeklyData: dailyConcentration, bestDay } = weeklyData;

  return (
    <View style={styles.container}>
      {/* 가장 집중한 요일 (7번) */}
      <Text style={styles.sectionTitle}>가장 집중한 요일</Text>
      <View style={styles.mostConcentratedDayContainer}>
        <Text style={styles.mostConcentratedDayText}>{bestDay?.day || '-'}</Text>
      </View>

      {/* 요일별 바 차트 (8번) */}
      <Text style={styles.sectionTitle}>요일별 집중도</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barChartScrollView}>
        <View style={styles.barChartContainer}>
          {daysOfWeekShort.map((dayLabel, index) => {
            const dayData = dailyConcentration.find(d => d.day === dayLabel) || { minutes: 0 };
            const height = dayData.minutes > 0 ? (dayData.minutes / 240) * 100 : 0; // 240분(4시간) 기준
            return (
              <View key={index} style={styles.barColumn}>
                <View style={[
                  styles.bar,
                  { height: `${height > 100 ? 100 : height}%` }
                ]} />
                <Text style={styles.barLabel}>{dayLabel}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* 주간 집중도 통계 (9번) */}
      <Text style={styles.sectionTitle}>주간 집중도 통계</Text>
      <View style={styles.statsSummaryContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>주간 누적 총 집중 시간</Text>
          <Text style={styles.statValue}>{Math.floor(stats.totalFocusTime / 60)}시간 {stats.totalFocusTime % 60}분</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>주간 평균 집중 시간</Text>
          <Text style={styles.statValue}>{stats.averageFocusTime}분</Text>
        </View>
      </View>

      {/* 집중 비율 (10번) */}
      <Text style={styles.sectionTitle}>집중 비율</Text>
      <View style={styles.ratioContainer}>
        <CircularProgress
          size={140}
          strokeWidth={15}
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
    paddingBottom: 40,
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
    paddingLeft: 20,
  },
  mostConcentratedDayContainer: {
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
    alignItems: 'center',
  },
  mostConcentratedDayText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.accentApricot,
  },
  barChartScrollView: {
    paddingLeft: 10,
    paddingRight: 20,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    paddingBottom: 10,
    justifyContent: 'space-around',
    flexGrow: 1,
  },
  barColumn: {
    width: 35,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.secondaryBrown,
    borderRadius: 5,
  },
  barLabel: {
    fontSize: FontSizes.small,
    color: Colors.secondaryBrown,
    marginTop: 8,
  },
  statsSummaryContainer: {
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
    paddingVertical: 5,
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
  ratioContainer: {
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
    alignItems: 'center',
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
});

export default WeeklyAnalysisView;