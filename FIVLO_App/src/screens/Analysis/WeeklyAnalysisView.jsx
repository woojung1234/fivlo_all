// src/screens/Analysis/WeeklyAnalysisView.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, ActivityIndicator, Alert } from 'react-native'; // ActivityIndicator, Alert 임포트 추가
import { format, startOfWeek, addDays, getWeek, getDay } from 'date-fns'; // getDay 임포트 추가
import { ko } from 'date-fns/locale';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';

// API 서비스 임포트
import { getWeeklyAnalysis } from '../../services/analysisApi'; // API 임포트

const WeeklyAnalysisView = ({ date, isPremiumUser }) => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 로드
  const fetchData = async (dateToFetch) => {
    setIsLoading(true);
    try {
      // Postman 가이드에 따라 'YYYY-WNN' 형식으로 주차 계산 (월요일 시작 주)
      const year = format(dateToFetch, 'yyyy');
      const weekNumber = getWeek(dateToFetch, { weekStartsOn: 1 }); // 월요일이 주의 시작
      const weekString = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

      const data = await getWeeklyAnalysis(weekString); // API 호출
      setWeeklyData(data);
    } catch (error) {
      console.error("Failed to fetch weekly analysis data:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '주간 분석 데이터를 불러오는데 실패했습니다.');
      setWeeklyData(null);
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

  if (!weeklyData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>해당 주간에 분석 데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 가장 집중한 요일 (7번) */}
      <Text style={styles.sectionTitle}>가장 집중한 요일</Text>
      <View style={styles.mostConcentratedDayContainer}>
        <Text style={styles.mostConcentratedDayText}>{weeklyData.mostConcentratedDay || '-'}</Text>
      </View>

      {/* 요일별 바 차트 (8번) */}
      <Text style={styles.sectionTitle}>요일별 집중도</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.barChartScrollView}>
        <View style={styles.barChartContainer}>
          {daysOfWeekShort.map((dayLabel, index) => {
            const dayData = weeklyData.dailyConcentration.find(d => d.day === dayLabel) || { minutes: 0 };
            const heightPercentage = (dayData.minutes / 240) * 100; // 240분(4시간) 기준
            return (
              <View key={index} style={styles.barColumn}>
                <View style={[
                  styles.bar,
                  { height: `${heightPercentage}%` }
                ]} />
                <Text style={styles.barLabel}>{dayLabel}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* 주간 집중도 통계 (9번) */}
      <Text style={styles.sectionTitle}>주간 집중도 통계</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>주간 누적 총 집중 시간</Text>
          <Text style={styles.statValue}>{weeklyData.totalConcentrationTime || 0}분</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>주간 평균 집중 시간</Text>
          <Text style={styles.statValue}>{weeklyData.averageConcentrationTime || 0}분</Text>
        </View>
      </View>

      {/* 집중 비율 (10번) */}
      <Text style={styles.sectionTitle}>집중 비율</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>집중 시간과 휴식 시간 비율</Text>
          <Text style={styles.statValue}>{weeklyData.concentrationRatio || 0}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>집중 시간</Text>
          <Text style={styles.statValue}>{weeklyData.focusTime || 0}분</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>휴식 시간</Text>
          <Text style={styles.statValue}>{weeklyData.breakTime || 0}분</Text>
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
  mostConcentratedDayContainer: {
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
    alignItems: 'center',
  },
  mostConcentratedDayText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.accentApricot,
  },
  barChartScrollView: {
    width: '100%',
    height: 200,
    paddingHorizontal: 10,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 10,
    paddingHorizontal: 5,
  },
  barColumn: {
    width: 35,
    marginHorizontal: 5,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.secondaryBrown,
    borderRadius: 3,
  },
  barLabel: {
    fontSize: FontSizes.small,
    color: Colors.secondaryBrown,
    marginTop: 5,
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

export default WeeklyAnalysisView;
