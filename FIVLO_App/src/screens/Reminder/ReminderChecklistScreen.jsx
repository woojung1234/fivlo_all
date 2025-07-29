// src/screens/Reminder/ReminderChecklistScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

// ReminderCompleteCoinModal 임포트
import ReminderCompleteCoinModal from './ReminderCompleteCoinModal';

// API 서비스 임포트
import { checkReminder } from '../../services/reminder';
import { earnCoin } from '../../services/coinApi';

const ReminderChecklistScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { reminderId, reminderTitle, checklistItems: initialChecklistItems, reminderLocation } = route.params || {
    reminderId: 'mock_reminder_id',
    reminderTitle: '알림 제목',
    checklistItems: ['지갑', '폰', '열쇠'],
    reminderLocation: null,
  };

  const [checklist, setChecklist] = useState(
    initialChecklistItems.map(item => ({ text: item, completed: false }))
  );
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 모든 항목 완료 여부 확인 및 코인 지급 (API 연동)
  useEffect(() => {
    const allCompleted = checklist.every(item => item.completed);
    if (allCompleted && checklist.length > 0) {
      const giveCoin = async () => {
        if (isPremiumUser) {
          setIsLoading(true);
          try {
            await earnCoin('reminder_complete', 1, `알림 체크리스트 완료: ${reminderTitle}`); // Postman 가이드 reason: 'reminder_complete'
            console.log('알림 체크리스트 완료 코인 지급 성공');
            setShowCoinModal(true);
          } catch (error) {
            console.error('알림 체크리스트 코인 지급 실패:', error.response ? error.response.data : error.message);
            Alert.alert('코인 지급 실패', error.response?.data?.message || '코인 지급 중 문제가 발생했습니다.');
          } finally {
            setIsLoading(false);
          }
        }
      };
      giveCoin();
    }
  }, [checklist, isPremiumUser, reminderTitle]);


  const toggleChecklistItem = async (index) => {
    setIsLoading(true);
    try {
      const response = await checkReminder(reminderId); // API 호출
      console.log('알림 체크 성공:', response);

      const newChecklist = [...checklist];
      newChecklist[index].completed = !newChecklist[index].completed;
      setChecklist(newChecklist);

    } catch (error) {
      console.error('알림 체크 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', '알림 체크 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChecklistItem = ({ item, index }) => (
    <TouchableOpacity style={styles.checklistItem} onPress={() => toggleChecklistItem(index)} disabled={isLoading}>
      <View style={styles.checkbox}>
        <FontAwesome5
          name={item.completed ? 'check-square' : 'square'}
          size={24}
          color={item.completed ? Colors.accentApricot : Colors.secondaryBrown}
        />
      </View>
      <Text style={[styles.itemText, item.completed && styles.itemTextCompleted]}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title={reminderTitle} showBackButton={true} />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <Text style={styles.instructionText}>무언가 놓고 가신 건 없으신가요?</Text>
        
        <FlatList
          data={checklist}
          renderItem={renderChecklistItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.checklistContent}
          scrollEnabled={false}
        />

        <View style={styles.actionButtonContainer}>
          <Button title="5분 뒤 다시" onPress={() => Alert.alert('알림', '5분 뒤 다시 알림을 보냅니다.')} primary={false} style={styles.actionButton} disabled={isLoading} />
          <Button title="오늘은 안 챙겨도 됨" onPress={() => Alert.alert('알림', '오늘 알림을 무시합니다.')} primary={false} style={styles.actionButton} disabled={isLoading} />
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showCoinModal}
        onRequestClose={() => setShowCoinModal(false)}
      >
        <ReminderCompleteCoinModal onClose={() => setShowCoinModal(false)} isPremiumUser={isPremiumUser} reminderTitle={reminderTitle} />
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
    alignItems: 'center',
  },
  instructionText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 30,
    textAlign: 'center',
  },
  checklistContent: {
    width: '100%',
    paddingBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    marginRight: 15,
  },
  itemText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    flex: 1,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.secondaryBrown,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 30,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ReminderChecklistScreen;
