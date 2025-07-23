// src/screens/Analysis/DailyAnalysisView.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, ActivityIndicator, Alert } from 'react-native'; // ActivityIndicator, Alert 임포트 추가
import { format } from 'date-fns';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';

// API 서비스 임포트
import { getDailyAnalysis } from '../../services/analysisApi'; // API 임포트

const DailyAnalysisView = ({ date, isPremiumUser }) => { // isPremiumUser prop 받기
  const [dailyData, setDailyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 로드
  const fetchData = async (dateToFetch) => {
    setIsLoading(true);
    try {
      const formattedDate = format(new Date(dateToFetch), 'yyyy-MM-dd');
      const data = await getDailyAnalysis(formattedDate); // API 호출
      setDailyData(data);
    } catch (error) {
      console.error("Failed to fetch daily analysis data:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '일간 분석 데이터를 불러오는데 실패했습니다.');
      setDailyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // date prop이 변경될 때마다 데이터 로드
  useEffect(() => {
    fetchData(date);
  }, [date]);

  // 시간대별 바 차트 데이터 생성 (3번)
  const hourlyChartData = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    const activitiesInHour = dailyData?.hourlyData?.[hour] || {}; // optional chaining
    const totalMinutesInHour = Object.values(activitiesInHour).reduce((sum, min) => sum + min, 0);
    return { hour, totalMinutes: totalMinutesInHour, activities: activitiesInHour };
  });

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityColorIndicator, { backgroundColor: item.color || Colors.secondaryBrown }]} />
      <Text style={styles.activityName}>{item.name}</Text>
      <Text style={styles.activityTime}>{item.time}분</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondaryBrown} />
        <Text style={styles.loadingText}>일간 분석 데이터 로딩 중...</Text>
      </View>
    );
  }

  if (!dailyData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>해당 날짜에 분석 데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 시간대별 바 차트 (3번) */}
      <Text style={styles.sectionTitle}>시간대별 집중 활동</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.barChartScrollView}>
        <View style={styles.barChartContainer}>
          {hourlyChartData.map((data, index) => (
            <View key={index} style={styles.barColumn}>
              {/* 활동별 색상으로 구분된 바 차트 표시 */}
              {Object.keys(data.activities).length > 0 ? (
                Object.keys(data.activities).map((activityName, idx) => {
                  const activity = dailyData.activities.find(act => act.name === activityName);
                  const heightPercentage = (data.activities[activityName] / 60) * 100; // 1시간 기준
                  return (
                    <View
                      key={`${index}-${idx}`}
                      style={[
                        styles.barSegment,
                        {
                          height: `${heightPercentage}%`,
                          backgroundColor: activity ? activity.color : Colors.secondaryBrown,
                        },
                      ]}
                    />
                  );
                })
              ) : (
                <View style={styles.emptyBarSegment} />
              )}
              <Text style={styles.barLabel}>{data.hour}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 집중 기록 (4번) */}
      <Text style={styles.sectionTitle}>집중 기록</Text>
      {dailyData.activities.length > 0 ? (
        <FlatList
          data={dailyData.activities}
          renderItem={renderActivityItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.activityListContent}
        />
      ) : (
        <Text style={styles.noDataText}>해당 날짜에 집중 기록이 없습니다.</Text>
      )}

      {/* 집중도 통계 (5번) */}
      <Text style={styles.sectionTitle}>집중도 통계</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 집중 시간</Text>
          <Text style={styles.statValue}>{dailyData.totalConcentrationTime || 0}분</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>집중 비율</Text>
          <Text style={styles.statValue}>{dailyData.concentrationRatio || 0}%</Text>
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
    width: 25,
    marginHorizontal: 5,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barSegment: {
    width: '100%',
    borderRadius: 3,
  },
  emptyBarSegment: {
    width: '100%',
    height: '10%',
    backgroundColor: Colors.primaryBeige,
    borderRadius: 3,
  },
  barLabel: {
    fontSize: FontSizes.small,
    color: Colors.secondaryBrown,
    marginTop: 5,
  },
  activityListContent: {
    width: '100%',
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontWeight: FontWeights.medium,
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

export default DailyAnalysisView;
