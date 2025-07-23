// src/screens/Reminder/ReminderAddEditScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, Modal, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// ReminderTimeSettingModal 임포트
import ReminderTimeSettingModal from './ReminderTimeSettingModal';

// API 서비스 임포트
import { createReminder, updateReminder } from '../../services/reminder'; // API 임포트

const ReminderAddEditScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const initialReminder = route.params?.reminder; // 수정 모드일 경우 기존 알림 데이터

  const [title, setTitle] = useState(initialReminder ? initialReminder.title : '');
  const [time, setTime] = useState(initialReminder ? `${initialReminder.time.hour.toString().padStart(2, '0')}:${initialReminder.time.minute.toString().padStart(2, '0')}` : '09:00'); // 기본 시간
  const [repeatDays, setRepeatDays] = useState(initialReminder ? initialReminder.days || [] : []); // 요일 반복
  const [location, setLocation] = useState(initialReminder && initialReminder.location ? initialReminder.location.name : ''); // 장소 이름
  const [locationCoords, setLocationCoords] = useState(initialReminder && initialReminder.location ? { latitude: initialReminder.location.latitude, longitude: initialReminder.location.longitude } : null); // 장소 좌표

  const [isLocationLocked, setIsLocationLocked] = useState(!isPremiumUser); // 장소 설정 잠금 여부 (isPremiumUser에 따라)

  const [checklistItems, setChecklistItems] = useState(initialReminder ? initialReminder.checklist || [''] : ['']);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 시간 설정 모달에서 시간 선택 시 콜백
  const onTimeSelected = (selectedTime, selectedRepeatDays) => {
    setTime(selectedTime);
    setRepeatDays(selectedRepeatDays);
    setShowTimeModal(false);
  };

  // 장소 설정 클릭 핸들러
  const handleLocationSetting = () => {
    if (!isPremiumUser) {
      Alert.alert('유료 기능', '장소 설정은 유료 버전에서만 이용 가능합니다. 결제 페이지로 이동하시겠습니까?');
      // navigation.navigate('PaymentScreen'); // 결제 페이지로 이동 (4번 페이지)
    } else {
      navigation.navigate('ReminderLocationSetting', {
        initialLocation: location,
        initialLocationCoords: locationCoords,
        onLocationSelected: (selectedLocName, selectedLocCoords) => {
          setLocation(selectedLocName);
          setLocationCoords(selectedLocCoords);
        }
      });
    }
  };

  // 체크리스트 항목 추가
  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, '']);
  };

  // 체크리스트 항목 텍스트 변경
  const handleChecklistItemChange = (text, index) => {
    const newItems = [...checklistItems];
    newItems[index] = text;
    setChecklistItems(newItems);
  };

  // 체크리스트 항목 삭제
  const removeChecklistItem = (index) => {
    const newItems = checklistItems.filter((_, i) => i !== index);
    setChecklistItems(newItems);
  };

  // "저장" 버튼 클릭 (API 연동)
  const handleSaveReminder = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const [hour, minute] = time.split(':').map(Number);
      const reminderData = {
        title: title,
        time: { hour, minute },
        days: repeatDays,
        checklist: checklistItems.filter(item => item.trim() !== ''),
        // 장소 정보 (유료 사용자만)
        location: isPremiumUser && location && locationCoords ? {
          name: location,
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
        } : undefined, // 장소 설정 안 했으면 undefined
      };

      let response;
      if (initialReminder) {
        response = await updateReminder(initialReminder.id, reminderData); // API 호출 (수정)
        Alert.alert('알림 수정', `"${title}" 알림이 수정되었습니다.`);
      } else {
        response = await createReminder(reminderData); // API 호출 (생성)
        Alert.alert('알림 저장', `"${title}" 알림이 저장되었습니다.`);
      }
      console.log('알림 저장/수정 성공:', response);
      navigation.navigate('Reminder'); // ReminderScreen으로 돌아가기
    } catch (error) {
      console.error('알림 저장/수정 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || '알림 저장/수정 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title={initialReminder ? "알림 수정" : "새로운 항목 추가"} showBackButton={true} />

      {isLoading && ( // 로딩 스피너 오버레이
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {/* 제목 입력 */}
        <Text style={styles.sectionTitle}>제목 입력</Text>
        <TextInput
          style={styles.inputField}
          placeholder="예: 약 챙기기"
          placeholderTextColor={Colors.secondaryBrown}
          value={title}
          onChangeText={setTitle}
          editable={!isLoading}
        />

        {/* 시간 설정 */}
        <Text style={styles.sectionTitle}>시간 설정</Text>
        <TouchableOpacity style={styles.settingButton} onPress={() => setShowTimeModal(true)} disabled={isLoading}>
          <Text style={styles.settingButtonText}>{time}</Text>
          <FontAwesome5 name="chevron-right" size={18} color={Colors.secondaryBrown} />
        </TouchableOpacity>

        {/* 장소 설정 (유료 기능) */}
        <Text style={styles.sectionTitle}>장소 설정</Text>
        <TouchableOpacity style={styles.settingButton} onPress={handleLocationSetting} disabled={isLoading}>
          <Text style={styles.settingButtonText}>
            {location ? location : '장소 설정 안 함'}
          </Text>
          {isLocationLocked && ( // 무료 사용자면 잠금 아이콘 표시
            <FontAwesome5 name="lock" size={18} color={Colors.secondaryBrown} style={styles.lockIcon} />
          )}
          <FontAwesome5 name="chevron-right" size={18} color={Colors.secondaryBrown} />
        </TouchableOpacity>

        {/* 체크리스트 항목 */}
        <Text style={styles.sectionTitle}>체크리스트 항목</Text>
        {checklistItems.map((item, index) => (
          <View key={index} style={styles.checklistItemContainer}>
            <TextInput
              style={styles.checklistInput}
              placeholder="체크할 항목"
              placeholderTextColor={Colors.secondaryBrown}
              value={item}
              onChangeText={(text) => handleChecklistItemChange(text, index)}
              editable={!isLoading}
            />
            {checklistItems.length > 1 && (
              <TouchableOpacity onPress={() => removeChecklistItem(index)} style={styles.removeChecklistButton} disabled={isLoading}>
                <FontAwesome5 name="minus-circle" size={20} color={Colors.secondaryBrown} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addChecklistItemButton} onPress={addChecklistItem} disabled={isLoading}>
          <FontAwesome5 name="plus-circle" size={20} color={Colors.secondaryBrown} />
          <Text style={styles.addChecklistItemText}>항목 추가</Text>
        </TouchableOpacity>

        {/* 저장 버튼 */}
        <Button title="저장" onPress={handleSaveReminder} style={styles.saveButton} disabled={isLoading} />
      </ScrollView>

      {/* 시간 설정 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTimeModal}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <ReminderTimeSettingModal
          initialTime={time}
          initialRepeatDays={repeatDays} // 요일 반복 초기값 전달
          onTimeSelected={onTimeSelected}
          onClose={() => setShowTimeModal(false)}
          isPremiumUser={isPremiumUser} // isPremiumUser 전달
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
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
  scrollViewContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
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
  inputField: {
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingButton: {
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
  settingButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  lockIcon: {
    marginRight: 10, // 잠금 아이콘과 텍스트 사이 간격
  },
  checklistItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  checklistInput: {
    flex: 1,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  removeChecklistButton: {
    padding: 10,
  },
  addChecklistItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
    marginTop: 10,
  },
  addChecklistItemText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    marginLeft: 10,
  },
  saveButton: {
    marginTop: 40,
    width: '100%',
  },
});

export default ReminderAddEditScreen;
