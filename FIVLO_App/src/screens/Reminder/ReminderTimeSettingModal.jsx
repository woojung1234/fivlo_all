// src/screens/Reminder/ReminderTimeSettingModal.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, setHours, setMinutes } from 'date-fns';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';

const ReminderTimeSettingModal = ({ initialTime, initialRepeatDays, onTimeSelected, onClose, isPremiumUser }) => { // isPremiumUser prop 받기
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState({
    '일': false, '월': false, '화': false, '수': false, '목': false, '금': false, '토': false
  });
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 (API 호출은 없지만 일관성 위해)


  // 초기 시간 및 요일 설정
  useEffect(() => {
    if (initialTime) {
      const [hours, minutes] = initialTime.split(':').map(Number);
      setSelectedDate(setMinutes(setHours(new Date(), hours), minutes));
    }
    if (initialRepeatDays && initialRepeatDays.length > 0) {
      const initialSelected = {};
      initialRepeatDays.forEach(day => {
        initialSelected[day] = true;
      });
      setSelectedDays(initialSelected);
    }
  }, [initialTime, initialRepeatDays]);

  const onChangeTime = (event, newDate) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSave = () => {
    const timeString = format(selectedDate, 'HH:mm');
    const selectedRepeatDays = Object.keys(selectedDays).filter(day => selectedDays[day]);

    if (onTimeSelected) {
      onTimeSelected(timeString, selectedRepeatDays); // 시간과 요일 전달
    }
    onClose();
  };

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {isLoading && ( // 로딩 스피너 오버레이
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.accentApricot} />
          </View>
        )}
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>시간 설정</Text>

          {/* 시간 선택 (6번 페이지) */}
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="spinner"
            onChange={onChangeTime}
            style={styles.timePicker}
          />

          {/* 요일 반복 설정 */}
          <Text style={styles.sectionTitle}>요일 반복</Text>
          <View style={styles.daysContainer}>
            {daysOfWeek.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, selectedDays[day] && styles.dayButtonActive]}
                onPress={() => toggleDay(day)}
                disabled={isLoading}
              >
                <Text style={[styles.dayButtonText, selectedDays[day] && styles.dayButtonTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Button title="취소" onPress={onClose} primary={false} style={styles.actionButton} disabled={isLoading} />
            <Button title="저장" onPress={handleSave} style={styles.actionButton} disabled={isLoading} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: Colors.textLight,
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
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
    borderRadius: 20,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  timePicker: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 10,
    width: '100%',
    textAlign: 'left',
    marginTop: 15,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryBeige,
    margin: 5,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  dayButtonActive: {
    backgroundColor: Colors.accentApricot,
  },
  dayButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  dayButtonTextActive: {
    color: Colors.textLight,
    fontWeight: FontWeights.bold,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ReminderTimeSettingModal;
