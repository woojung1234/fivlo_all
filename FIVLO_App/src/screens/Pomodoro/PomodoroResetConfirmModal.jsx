// src/screens/Pomodoro/PomodoroResetConfirmModal.jsx

import React, { useEffect, useState } from 'react'; // useState 임포트 추가
import { View, Text, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation, useRoute } from '@react-navigation/native';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';

// API 서비스 임포트
import { completePomodoroSession } from '../../services/pomodoroApi'; // API 임포트

const PomodoroResetConfirmModal = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const route = useRoute();
  const { onConfirm, onCancel, sessionId } = route.params; // sessionId 받기

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK' && onCancel) {
        onCancel();
      }
    });
    return unsubscribe;
  }, [navigation, onCancel]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await completePomodoroSession(sessionId); // API 호출 (초기화는 완료로 처리)
      console.log('포모도로 초기화 성공 (완료 처리)');
      if (onConfirm) {
        onConfirm();
      }
      navigation.goBack();
    } catch (error) {
      console.error('포모도로 초기화 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || '초기화 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    navigation.goBack();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        {isLoading && ( // 로딩 스피너 오버레이
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.accentApricot} />
          </View>
        )}
        <View style={styles.modalContent}>
          <CharacterImage style={styles.obooniImage} />
          <Text style={styles.questionText}>
            포모도로를 끝낼지 지속할지 묻습니다.
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="예" onPress={handleConfirm} style={styles.modalButton} disabled={isLoading} />
            <Button title="아니오" onPress={handleCancel} primary={false} style={styles.modalButton} disabled={isLoading} />
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
  obooniImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  questionText: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default PomodoroResetConfirmModal;
