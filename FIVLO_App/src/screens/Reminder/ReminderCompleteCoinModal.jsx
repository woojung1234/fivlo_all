// src/screens/Reminder/ReminderCompleteCoinModal.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { earnCoin } from '../../services/coinApi';

const ReminderCompleteCoinModal = ({ isVisible, onClose, isPremiumUser, reminderTitle }) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const giveCoin = async () => {
      if (isVisible && isPremiumUser) {
        setIsLoading(true);
        try {
          await earnCoin('reminder_complete', 1, `알림 체크리스트 완료: ${reminderTitle}`);
          console.log('알림 체크리스트 완료 코인 지급 성공');
        } catch (error) {
          console.error('알림 체크리스트 코인 지급 실패:', error.response ? error.response.data : error.message);
          Alert.alert('코인 지급 실패', error.response?.data?.message || '코인 지급 중 문제가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    giveCoin();
  }, [isVisible, isPremiumUser, reminderTitle]);


  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.accentApricot} />
            </View>
          )}
          <CharacterImage style={styles.obooniImage} />
          <Text style={styles.messageText}>
            모든 항목을 체크했어요!{"\n"}오분이가 코인을 드렸습니다 ~
          </Text>
          <Button title="확인" onPress={onClose} style={styles.confirmButton} disabled={isLoading} />
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
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
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
    borderRadius: 20,
    zIndex: 10,
  },
  obooniImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  messageText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  confirmButton: {
    width: '70%',
  },
});

export default ReminderCompleteCoinModal;
