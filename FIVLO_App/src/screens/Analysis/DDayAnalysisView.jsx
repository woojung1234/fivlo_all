// src/screens/Analysis/DDayAnalysisView.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays, isSameDay, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { getDDayAnalysis } from '../../services/analysisApi'; // API 임포트
import { getPomodoroGoals } from '../../services/pomodoroApi'; // D-Day 목표 선택을 위해 포모도로 목표 목록 필요

// 캘린더 한국어 설정 (TaskCalendarScreen과 동일)
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';


const DDayAnalysisView = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const [isLocked, setIsLocked] = useState(!isPremiumUser); // 유료 기능 잠금 여부

  const [goalPhrase, setGoalPhrase] = useState(''); // 목표 문구
  const [goalDate, setGoalDate] = useState(new Date()); // 목표 기간
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null); // 선택된 포모도로 목표 ID

  const [dDayAnalysisData, setDDayAnalysisData] = useState(null); // D-Day 분석 데이터
  const [pomodoroGoals, setPomodoroGoals] = useState([]); // 포모도로 목표 목록
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태


  // 포모도로 목표 목록 로드
  useEffect(() => {
    const fetchPomodoroGoals = async () => {
      setIsLoading(true);
      try {
        const data = await getPomodoroGoals(); // API 호출
        setPomodoroGoals(data);
        if (data.length > 0) {
          setSelectedGoalId(data[0].id); // 첫 번째 목표를 기본 선택
        }
      } catch (error) {
        console.error("Failed to fetch pomodoro goals for D-Day:", error.response ? error.response.data : error.message);
        Alert.alert('오류', 'D-Day 목표를 불러오는데 실패했습니다.');
        setPomodoroGoals([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (isPremiumUser) { // 유료 사용자일 때만 로드
      fetchPomodoroGoals();
    }
  }, [isPremiumUser]);

  // 선택된 목표 ID가 변경될 때 D-Day 분석 데이터 로드
  useEffect(() => {
    const fetchDDayData = async () => {
      if (!selectedGoalId) return;
      setIsLoading(true);
      try {
        const data = await getDDayAnalysis(selectedGoalId); // API 호출
        setDDayAnalysisData(data);
        setGoalPhrase(data.goal || ''); // API 응답에서 목표 문구 설정
        setGoalDate(data.date ? new Date(data.date) : new Date()); // API 응답에서 목표 날짜 설정
      } catch (error) {
        console.error("Failed to fetch D-Day analysis data:", error.response ? error.response.data : error.message);
        Alert.alert('오류', 'D-Day 분석 데이터를 불러오는데 실패했습니다.');
        setDDayAnalysisData(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (isPremiumUser && selectedGoalId) {
      fetchDDayData();
    }
  }, [selectedGoalId, isPremiumUser]);


  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || goalDate;
    setShowDatePicker(false);
    setGoalDate(currentDate);
  };

  const handleSetGoalPhrase = () => {
    Alert.alert('목표 문구 설정', '목표 문구를 설정하는 모달/화면으로 이동합니다.');
    // navigation.navigate('SetGoalPhraseModal'); // 목표 문구 설정 모달/화면으로 이동
  };

  const handleStartPomodoro = () => {
    Alert.alert('포모도로 연동', '이 목표로 포모도로 기능을 시작합니다.');
    // navigation.navigate('PomodoroTimer', { selectedGoal: { id: selectedGoalId, text: goalPhrase, color: Colors.accentApricot } });
  };

  // 캘린더 달성일 표기 (29번)
  const getMarkedDatesForCalendar = () => {
    const marked = {};
    if (!dDayAnalysisData || !dDayAnalysisData.dailyConcentration) return marked;

    const start = startOfMonth(dDayAnalysisData.date ? new Date(dDayAnalysisData.date) : new Date());
    const end = endOfMonth(dDayAnalysisData.date ? new Date(dDayAnalysisData.date) : new Date());
    const daysInMonth = eachDayOfInterval({ start, end });

    daysInMonth.forEach(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const minutes = dDayAnalysisData.dailyConcentration[dayString]?.minutes || 0;
      let obooniImageSource = null;

      if (minutes > 0) {
        if (minutes < 60) { // 0 ~ 1시간: 회색 슬픔 오분이
          obooniImageSource = require('../../../assets/images/obooni_sad.png');
        } else if (minutes >= 60 && minutes < 120) { // 1 ~ 2시간: 갈색 무뚝뚝 오분이
          obooniImageSource = require('../../../assets/images/obooni_default.png');
        } else { // 2시간 이상: 빨간색 기쁨 오분이
          obooniImageSource = require('../../../assets/images/obooni_happy.png');
        }
      }

      if (obooniImageSource) {
        marked[dayString] = {
          customStyles: {
            container: {
              backgroundColor: minutes > 120 ? Colors.accentApricot : (minutes > 60 ? Colors.secondaryBrown : Colors.primaryBeige),
              borderRadius: 5,
            },
            text: {
              color: minutes > 0 ? Colors.textLight : Colors.textDark,
            },
          },
          dots: [{ key: 'obooni', color: obooniImageSource ? Colors.accentApricot : 'transparent', selectedDotColor: 'transparent' }],
        };
      }
    });
    return marked;
  };


  if (isLocked) {
    return (
      <View style={styles.lockedContainer}>
        <FontAwesome5 name="lock" size={80} color={Colors.secondaryBrown} />
        <Text style={styles.lockedText}>이 기능은 유료 버전에서만 이용 가능합니다.</Text>
        <Button
          title="유료 버전 구매하기"
          onPress={() => Alert.alert('결제 유도', '유료 버전 구매 페이지로 이동합니다.')}
          style={styles.purchaseButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && ( // 로딩 스피너 오버레이
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {/* 목표 문구 설정 기능 (22, 23번) */}
        <Text style={styles.sectionTitle}>목표 문구 설정</Text>
        <TouchableOpacity style={styles.goalPhraseButton} onPress={handleSetGoalPhrase} disabled={isLoading}>
          <Text style={styles.goalPhraseText}>
            {dDayAnalysisData?.phrase || '달성하고자 하는 목표를 입력하세요'}
          </Text>
          <FontAwesome5 name="edit" size={18} color={Colors.secondaryBrown} />
        </TouchableOpacity>

        {/* 목표 기간 설정 (24번) */}
        <Text style={styles.sectionTitle}>목표 기간 설정</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton} disabled={isLoading}>
          <Text style={styles.datePickerButtonText}>
            {format(goalDate, 'yyyy년 MM월 dd일')}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={goalDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}

        {/* 포모도로 목표 선택 드롭다운 (D-Day 분석을 위한 목표 선택) */}
        <Text style={styles.sectionTitle}>분석할 포모도로 목표 선택</Text>
        {pomodoroGoals.length > 0 ? (
          <View style={styles.goalPickerContainer}>
            {/* 실제 드롭다운 컴포넌트 사용 (예: @react-native-picker/picker) */}
            {/* 여기서는 임시로 버튼으로 대체 */}
            <TouchableOpacity onPress={() => Alert.alert('목표 선택', '드롭다운으로 목표를 선택하세요.')} style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>
                {pomodoroGoals.find(g => g.id === selectedGoalId)?.title || '목표 선택'}
              </Text>
              <FontAwesome5 name="chevron-down" size={16} color={Colors.secondaryBrown} />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noDataText}>등록된 포모도로 목표가 없습니다.</Text>
        )}


        {/* 시작하기 버튼 (25번) */}
        <Button title="시작하기" onPress={handleStartPomodoro} style={styles.startButton} disabled={isLoading || !selectedGoalId} />

        {/* 집중 목표 표시화 (27번) */}
        <Text style={styles.sectionTitle}>집중 목표</Text>
        <View style={styles.goalDisplayContainer}>
          <Text style={styles.goalDisplayText}>{dDayAnalysisData?.phrase || '-'}</Text>
          <Text style={styles.dDayText}>D-{differenceInDays(new Date(dDayAnalysisData?.date || new Date()), new Date())}</Text>
        </View>

        {/* 집중 요약 (28번) */}
        <Text style={styles.sectionTitle}>집중 요약</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>총 집중 시간</Text>
            <Text style={styles.statValue}>{dDayAnalysisData?.totalConcentrationTime || 0}분</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>현재까지 목표 달성율</Text>
            <Text style={styles.statValue}>{dDayAnalysisData?.currentAchievementRate || 0}%</Text>
          </View>
        </View>

        {/* 캘린더 달성일 표기 (29번) */}
        <Text style={styles.sectionTitle}>캘린더 달성일</Text>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 0,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    paddingTop: 10,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryBeige,
    paddingHorizontal: 20,
  },
  lockedText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  purchaseButton: {
    width: '80%',
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginTop: 25,
    marginBottom: 10,
    width: '100%',
    textAlign: 'left',
  },
  goalPhraseButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalPhraseText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    flex: 1,
  },
  datePickerButton: {
    width: '100%',
    backgroundColor: Colors.textLight,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  datePickerButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    fontWeight: FontWeights.regular,
  },
  startButton: {
    width: '100%',
    marginTop: 30,
  },
  goalDisplayContainer: {
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  goalDisplayText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  dDayText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    fontWeight: FontWeights.bold,
  },
  statsContainer: {
    width: '100%',
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
  loadingOverlay: { // 로딩 스피너 오버레이
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    zIndex: 10,
  },
  goalPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  pickerButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
});

export default DDayAnalysisView;
