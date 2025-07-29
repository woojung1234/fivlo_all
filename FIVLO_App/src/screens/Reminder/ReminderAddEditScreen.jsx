// src/screens/Reminder/ReminderAddEditScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, Modal, ActivityIndicator } from 'react-native';
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
import { createReminder, updateReminder } from '../../services/reminder';

const ReminderAddEditScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const initialReminder = route.params?.reminder;

  const [title, setTitle] = useState(initialReminder ? initialReminder.title : '');
  const [time, setTime] = useState(initialReminder ? `${initialReminder.time.hour.toString().padStart(2, '0')}:${initialReminder.time.minute.toString().padStart(2, '0')}` : '09:00');
  const [repeatDays, setRepeatDays] = useState(initialReminder ? initialReminder.days || [] : []);
  const [location, setLocation] = useState(initialReminder && initialReminder.location ? initialReminder.location.name : '');
  const [locationCoords, setLocationCoords] = useState(initialReminder && initialReminder.location ? { latitude: initialReminder.location.latitude, longitude: initialReminder.location.longitude } : null);

  const [isLocationLocked, setIsLocationLocked] = useState(!isPremiumUser);

  const [checklistItems, setChecklistItems] = useState(initialReminder ? initialReminder.checklist || [''] : ['']);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onTimeSelected = (selectedTime, selectedRepeatDays) => {
    setTime(selectedTime);
    setRepeatDays(selectedRepeatDays);
    setShowTimeModal(false);
  };

  const handleLocationSetting = () => {
    if (!isPremiumUser) {
      Alert.alert('유료 기능', '장소 설정은 유료 버전에서만 이용 가능합니다. 결제 페이지로 이동하시겠습니까?');
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

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, '']);
  };

  const handleChecklistItemChange = (text, index) => {
    const newItems = [...checklistItems];
    newItems[index] = text;
    setChecklistItems(newItems);
  };

  const removeChecklistItem = (index) => {
    const newItems = checklistItems.filter((_, i) => i !== index);
    setChecklistItems(newItems);
  };

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
        location: isPremiumUser && location && locationCoords ? {
          name: location,
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
        } : undefined,
      };

      let response;
      if (initialReminder) {
        response = await updateReminder(initialReminder.id, reminderData);
        Alert.alert('알림 수정', `"${title}" 알림이 수정되었습니다.`);
      } else {
        response = await createReminder(reminderData);
        Alert.alert('알림 저장', `"${title}" 알림이 저장되었습니다.`);
      }
      console.log('알림 저장/수정 성공:', response);
      navigation.navigate('Reminder');
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

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <Text style={styles.sectionTitle}>제목 입력</Text>
        <TextInput
          style={styles.inputField}
          placeholder="예: 약 챙기기"
          placeholderTextColor={Colors.secondaryBrown}
          value={title}
          onChangeText={setTitle}
          editable={!isLoading}
        />

        <Text style={styles.sectionTitle}>시간 설정</Text>
        <TouchableOpacity style={styles.settingButton} onPress={() => setShowTimeModal(true)} disabled={isLoading}>
          <Text style={styles.settingButtonText}>{time}</Text>
          <FontAwesome5 name="chevron-right" size={18} color={Colors.secondaryBrown} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>장소 설정</Text>
        <TouchableOpacity style={styles.settingButton} onPress={handleLocationSetting} disabled={isLoading}>
          <Text style={styles.settingButtonText}>
            {location ? location : '장소 설정 안 함'}
          </Text>
          {isLocationLocked && (
            <FontAwesome5 name="lock" size={18} color={Colors.secondaryBrown} style={styles.lockIcon} />
          )}
          <FontAwesome5 name="chevron-right" size={18} color={Colors.secondaryBrown} />
        </TouchableOpacity>

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

        <Button title="저장" onPress={handleSaveReminder} style={styles.saveButton} disabled={isLoading} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showTimeModal}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <ReminderTimeSettingModal
          initialTime={time}
          initialRepeatDays={repeatDays}
          onTimeSelected={onTimeSelected}
          onClose={() => setShowTimeModal(false)}
          isPremiumUser={isPremiumUser}
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
  loadingOverlay: {
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
    marginRight: 10,
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
