// src/screens/Analysis/AnalysisGraphScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, getWeek } from 'date-fns'; // getWeek 임포트 추가
import { ko } from 'date-fns/locale';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../styles/GlobalStyles';
import { Colors } from '../styles/color';
import { FontSizes, FontWeights } from '../styles/Fonts';
import Header from '../components/common/Header';

// 각 분석 뷰 컴포넌트 임포트
import DailyAnalysisView from './Analysis/DailyAnalysisView';
import WeeklyAnalysisView from './Analysis/WeeklyAnalysisView';
import MonthlyAnalysisView from './Analysis/MonthlyAnalysisView';
import DDayAnalysisView from './Analysis/DDayAnalysisView';

const AnalysisGraphScreen = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'weekly', 'monthly', 'dday'
  const [currentDate, setCurrentDate] = useState(new Date()); // 일간/주간/월간 날짜 탐색 기준
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 날짜 탐색 핸들러
  const handleDateNavigation = (direction) => {
    let newDate = currentDate;
    if (activeTab === 'daily') {
      newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
    } else if (activeTab === 'weekly') {
      newDate = direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1);
    } else if (activeTab === 'monthly') {
      newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    }
    setCurrentDate(newDate);
  };

  // 현재 날짜/기간 텍스트 포맷
  const getFormattedDate = () => {
    if (activeTab === 'daily') {
      return format(currentDate, 'yyyy년 MM월 dd일 EEEE', { locale: ko });
    } else if (activeTab === 'weekly') {
      // 주차 계산 (ISO 주차 기준)
      const weekNumber = getWeek(currentDate, { weekStartsOn: 1 }); // 월요일 시작 주
      return `${format(currentDate, 'yyyy년')} ${weekNumber}주차`;
    } else if (activeTab === 'monthly') {
      return format(currentDate, 'yyyy년 MM월', { locale: ko });
    }
    return '';
  };

  // D-Day 탭 클릭 시 유료 기능 안내
  const handleDDayTabPress = () => {
    if (!isPremiumUser) {
      Alert.alert('유료 기능', 'D-Day 분석은 유료 버전에서만 이용 가능합니다. 결제 페이지로 이동하시겠습니까?');
      // navigation.navigate('PaymentScreen'); // 결제 페이지로 이동
    } else {
      setActiveTab('dday');
    }
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="집중도 분석" showBackButton={true} />

      {/* 분석 탭 네비게이션 (1번) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'daily' && styles.tabButtonActive]}
          onPress={() => setActiveTab('daily')}
        >
          <Text style={[styles.tabText, activeTab === 'daily' && styles.tabTextActive]}>일간</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'weekly' && styles.tabButtonActive]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[styles.tabText, activeTab === 'weekly' && styles.tabTextActive]}>주간</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'monthly' && styles.tabButtonActive]}
          onPress={() => setActiveTab('monthly')}
        >
          <Text style={[styles.tabText, activeTab === 'monthly' && styles.tabTextActive]}>월간</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'dday' && styles.tabButtonActive]}
          onPress={handleDDayTabPress}
        >
          <Text style={[styles.tabText, activeTab === 'dday' && styles.tabTextActive]}>D-Day</Text>
          {!isPremiumUser && <FontAwesome5 name="lock" size={12} color={Colors.secondaryBrown} style={styles.lockIcon} />}
        </TouchableOpacity>
      </View>

      {/* 날짜 탐색 (2, 6, 11번) */}
      {activeTab !== 'dday' && ( // D-Day 탭에서는 날짜 탐색 없음
        <View style={styles.dateNavigationContainer}>
          <TouchableOpacity onPress={() => handleDateNavigation('prev')} style={styles.dateNavButton}>
            <Text style={styles.dateNavButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.currentDateText}>{getFormattedDate()}</Text>
          <TouchableOpacity onPress={() => handleDateNavigation('next')} style={styles.dateNavButton}>
            <Text style={styles.dateNavButtonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 각 탭에 따른 콘텐츠 렌더링 */}
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {/* 로딩 스피너는 각 뷰 컴포넌트 내부에서 처리 */}
        {activeTab === 'daily' && <DailyAnalysisView date={currentDate} isPremiumUser={isPremiumUser} />}
        {activeTab === 'weekly' && <WeeklyAnalysisView date={currentDate} isPremiumUser={isPremiumUser} />}
        {activeTab === 'monthly' && <MonthlyAnalysisView date={currentDate} isPremiumUser={isPremiumUser} />}
        {activeTab === 'dday' && <DDayAnalysisView isPremiumUser={isPremiumUser} />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 5,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.accentApricot,
  },
  tabText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    fontWeight: FontWeights.medium,
  },
  tabTextActive: {
    color: Colors.textLight,
    fontWeight: FontWeights.bold,
  },
  lockIcon: {
    marginLeft: 5,
  },
  dateNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    paddingVertical: 10,
    marginBottom: 20,
    alignSelf: 'center',
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
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});

export default AnalysisGraphScreen;
