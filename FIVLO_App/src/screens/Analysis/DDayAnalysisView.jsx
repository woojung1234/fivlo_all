// src/screens/Analysis/DDayAnalysisView.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Modal, FlatList, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays, startOfMonth, getDaysInMonth } from 'date-fns';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';

// API 서비스 임포트
import { getDDayAnalysis, createDDayGoal } from '../../services/analysisApi';
import { getPomodoroGoals } from '../../services/pomodoroApi';

// D-Day 탭 전용 '오분이' 그리드 캘린더
const DDayCalendarGrid = ({ data, monthDate }) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = getDaysInMonth(monthDate);
  const startDay = startOfMonth(monthDate).getDay(); // 0: Sun, 1: Mon ...
  
  const gridData = Array(startDay).fill({ empty: true }).concat(
    Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const minutes = data[dayString]?.minutes || 0;
      let imageSource;
      if (minutes > 0) {
        if (minutes >= 120) imageSource = require('../../../assets/images/obooni_happy.png');
        else if (minutes >= 60) imageSource = require('../../../assets/images/obooni_default.png');
        else imageSource = require('../../../assets/images/obooni_sad.png');
      } else {
        imageSource = require('../../../assets/images/obooni_sad.png'); // 집중 기록 없는 날
      }
      return { day, imageSource };
    })
  );

  return (
    <View style={styles.gridContainer}>
      {gridData.map((item, index) => (
        <View key={index} style={styles.gridCell}>
          {item.imageSource && <Image source={item.imageSource} style={styles.gridObooniImage} />}
        </View>
      ))}
    </View>
  );
};

const DDayAnalysisView = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const [isLocked] = useState(!isPremiumUser);

  const [dDayAnalysisData, setDDayAnalysisData] = useState(null);
  const [pomodoroGoals, setPomodoroGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // D-Day 설정용 State
  const [goalPhrase, setGoalPhrase] = useState('');
  const [goalDate, setGoalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPomodoroGoalId, setSelectedPomodoroGoalId] = useState(null);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);

  const fetchDDayData = async () => {
    if (!isPremiumUser) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // 등록된 D-Day 목표가 있는지 확인하는 API 호출 필요
      // 여기서는 임시로 dDayAnalysisData가 없다고 가정
      const data = await getDDayAnalysis(); // 실제로는 goalId 등을 넘겨야 함
      if (data) {
        setDDayAnalysisData(data);
      } else {
        const goals = await getPomodoroGoals();
        setPomodoroGoals(goals);
      }
    } catch (error) {
      const goals = await getPomodoroGoals(); // D-Day 데이터가 없으면 목표 목록 로드
      setPomodoroGoals(goals);
      setDDayAnalysisData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDDayData();
  }, [isPremiumUser]);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || goalDate;
    setShowDatePicker(Platform.OS === 'ios');
    setGoalDate(currentDate);
  };

  const handleCreateDDay = async () => {
    if (!goalPhrase || !selectedPomodoroGoalId) {
      Alert.alert('입력 오류', '목표 문구와 포모도로 목표를 모두 선택해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const newDDay = {
        phrase: goalPhrase,
        date: format(goalDate, 'yyyy-MM-dd'),
        pomodoroGoalId: selectedPomodoroGoalId,
      };
      await createDDayGoal(newDDay); // D-Day 생성 API 호출
      fetchDDayData(); // 데이터 다시 로드
    } catch (error) {
      Alert.alert('오류', 'D-Day 목표 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondaryBrown} />
      </View>
    );
  }
  
  if (isLocked) {
    return (
      <View style={styles.lockedContainer}>
        <Image source={require('../../../assets/images/obooni_sad.png')} style={styles.lockedImage} />
        <Text style={styles.lockedText}>목표를 입력해주세요!</Text>
        <Text style={styles.lockedSubText}>D-DAY 기능은 프리미엄 구독 시 사용 가능해요</Text>
      </View>
    );
  }

  // D-Day 데이터가 없을 경우, 설정 화면 표시
  if (!dDayAnalysisData) {
    return (
      <ScrollView contentContainerStyle={styles.setupContainer}>
        <Text style={styles.sectionTitle}>목표 문구 설정</Text>
        <View style={styles.goalPhraseContainer}>
          <TextInput
            style={styles.goalPhraseInput}
            placeholder="달성하고자 하는 목표를 입력하세요!"
            value={goalPhrase}
            onChangeText={setGoalPhrase}
          />
        </View>

        <Text style={styles.sectionTitle}>목표 기간 설정</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerButtonText}>{format(goalDate, 'yyyy년 MM월 dd일')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={goalDate}
            mode="date"
            display="spinner"
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}
        
        <Text style={styles.sectionTitle}>연동할 포모도로 목표 선택</Text>
        <TouchableOpacity onPress={() => setIsGoalModalVisible(true)} style={styles.pickerButton}>
            <Text style={styles.pickerButtonText}>
                {pomodoroGoals.find(g => g.id === selectedPomodoroGoalId)?.title || '포모도로 목표 선택하기'}
            </Text>
            <FontAwesome5 name="chevron-down" size={16} color={Colors.secondaryBrown} />
        </TouchableOpacity>

        <Button title="시작하기" onPress={handleCreateDDay} style={styles.startButton} />
        
        <Modal
            animationType="slide"
            transparent={true}
            visible={isGoalModalVisible}
            onRequestClose={() => setIsGoalModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsGoalModalVisible(false)}>
            <View style={styles.goalModalContent}>
                <Text style={styles.goalModalTitle}>무엇에 집중하실건가요?</Text>
                <FlatList
                    data={pomodoroGoals}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.goalModalItem}
                            onPress={() => {
                                setSelectedPomodoroGoalId(item.id);
                                setIsGoalModalVisible(false);
                            }}
                        >
                            <Text style={styles.goalModalItemText}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    );
  }

  // D-Day 데이터가 있을 경우, 분석 화면 표시
  return (
    <ScrollView style={styles.container}>
      <View style={styles.goalDisplayContainer}>
        <Text style={styles.goalDisplayText}>{dDayAnalysisData.phrase}</Text>
        <Text style={styles.dDayText}>D-{differenceInDays(new Date(dDayAnalysisData.date), new Date())}</Text>
      </View>

      <Text style={styles.sectionTitle}>집중 요약</Text>
      <View style={styles.statsSummaryContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 집중 시간</Text>
          <Text style={styles.statValue}>{dDayAnalysisData.totalConcentrationTime || 0}분</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>현재까지 목표 달성율</Text>
          <Text style={styles.statValue}>{dDayAnalysisData.currentAchievementRate || 0}%</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>캘린더 달성일</Text>
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
           <Text style={styles.calendarHeaderText}>{format(new Date(dDayAnalysisData.date), 'yyyy년 MM월')}</Text>
        </View>
        <DDayCalendarGrid 
          data={dDayAnalysisData.dailyConcentration} 
          monthDate={new Date(dDayAnalysisData.date)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    paddingHorizontal: 20,
    borderRadius: 15,
    margin: 20,
  },
  lockedImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  lockedText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  lockedSubText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
  },
  container: {
    width: '100%',
    paddingHorizontal: 0,
  },
  setupContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginTop: 25,
    marginBottom: 15,
  },
  goalPhraseContainer: {
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    padding: 15,
  },
  goalPhraseInput: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  datePickerButton: {
    backgroundColor: Colors.textLight,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  datePickerButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    padding: 15,
  },
  pickerButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  startButton: {
    marginTop: 30,
  },
  goalDisplayContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  goalDisplayText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 10,
  },
  dDayText: {
    fontSize: FontSizes.extraLarge,
    color: Colors.accentApricot,
    fontWeight: FontWeights.bold,
  },
  statsSummaryContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 20,
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
  },
  statValue: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    fontWeight: FontWeights.bold,
  },
  calendarContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 15,
    marginBottom: 40,
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  calendarHeaderText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridObooniImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  goalModalContent: {
    backgroundColor: Colors.textLight,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  goalModalTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  goalModalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryBeige,
  },
  goalModalItemText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    textAlign: 'center',
  },
});

export default DDayAnalysisView;