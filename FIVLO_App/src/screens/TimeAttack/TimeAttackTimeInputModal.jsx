// src/screens/TimeAttack/TimeAttackTimeInputModal.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';

const TimeAttackTimeInputModal = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const route = useRoute();
  const { initialMinutes } = route.params;

  const [inputMinutes, setInputMinutes] = useState(initialMinutes.toString().padStart(2, '0'));
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  const handleInputConfirm = () => {
    const minutes = parseInt(inputMinutes, 10);
    if (isNaN(minutes) || minutes < 0 || minutes > 999) {
      Alert.alert('알림', '0분 이상 999분 이하의 유효한 시간을 입력해주세요.');
      return;
    }
    // navigation.navigate 대신 navigation.goBack()으로 이전 화면에 값 전달
    navigation.navigate({
      name: 'TimeAttackGoalSetting', // 돌아갈 화면의 이름
      params: { selectedMinutes: minutes.toString().padStart(2, '0') }, // 전달할 값
      merge: true, // 기존 params와 병합
    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleNumberPress = (num) => {
    setInputMinutes(prev => {
      const currentVal = prev === '00' ? '' : prev;
      const newVal = currentVal + num.toString();
      if (newVal.length > 3) return prev; // 최대 3자리
      return newVal.padStart(2, '0'); // 항상 2자리 이상 유지 (예: '05', '10')
    });
  };

  const handleDelete = () => {
    setInputMinutes(prev => {
      const newVal = prev.slice(0, -1);
      return newVal === '' ? '00' : newVal.padStart(2, '0');
    });
  };

  return (
    <Modal
      animationType="slide"
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
          <Text style={styles.modalTitle}>시간 입력 (분)</Text>
          <TextInput
            style={styles.timeDisplayInput}
            value={inputMinutes}
            keyboardType="number-pad"
            onChangeText={(text) => setInputMinutes(text.replace(/[^0-9]/g, ''))}
            maxLength={3}
            showSoftInputOnFocus={false}
            textAlign="center"
            editable={!isLoading}
          />

          <View style={styles.keypadContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <TouchableOpacity key={num} style={styles.keypadButton} onPress={() => handleNumberPress(num)} disabled={isLoading}>
                <Text style={styles.keypadButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.keypadButtonPlaceholder} />
            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress(0)} disabled={isLoading}>
              <Text style={styles.keypadButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadButton} onPress={handleDelete} disabled={isLoading}>
              <FontAwesome5 name="backspace" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonContainer}>
            <Button title="취소" onPress={handleCancel} primary={false} style={styles.actionButton} disabled={isLoading} />
            <Button title="확인" onPress={handleInputConfirm} style={styles.actionButton} disabled={isLoading} />
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
  modalTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 20,
  },
  timeDisplayInput: {
    width: '80%',
    height: 80,
    backgroundColor: Colors.primaryBeige,
    borderRadius: 15,
    fontSize: FontSizes.extraLarge * 2,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minuteLabel: {
    fontSize: FontSizes.large,
    color: Colors.textDark,
    marginBottom: 20,
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  keypadButton: {
    width: '30%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: Colors.primaryBeige,
  },
  keypadButtonPlaceholder: {
    width: '30%',
    height: 60,
    marginVertical: 5,
  },
  keypadButtonText: {
    fontSize: FontSizes.extraLarge,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
  },
  actionButtonContainer: {
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

export default TimeAttackTimeInputModal;
