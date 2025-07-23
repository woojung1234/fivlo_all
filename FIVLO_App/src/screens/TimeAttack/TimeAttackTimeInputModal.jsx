// src/screens/TimeAttack/TimeAttackTimeInputModal.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, TextInput } from 'react-native'; // Modal 임포트 확인!
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';

const TimeAttackTimeInputModal = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // onTimeSelected를 params로 직접 전달하는 대신, goBack() 시 콜백을 호출하도록 변경
  const { initialMinutes } = route.params; // onTimeSelected는 더 이상 params로 받지 않음

  const [inputMinutes, setInputMinutes] = useState(initialMinutes.toString().padStart(2, '0'));
  const [showKeyboard, setShowKeyboard] = useState(false);

  useEffect(() => {
    setShowKeyboard(true);
  }, []);

  const handleInputConfirm = () => {
    const minutes = parseInt(inputMinutes, 10);
    if (isNaN(minutes) || minutes < 0 || minutes > 999) {
      Alert.alert('알림', '0분 이상 999분 이하의 유효한 시간을 입력해주세요.');
      return;
    }
    // goBack() 시 이전 화면에 값을 전달하는 방법 (React Navigation 5+ 권장 방식)
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
    if (inputMinutes === '00' && num !== '.') {
      setInputMinutes(num.toString());
    } else {
      if (inputMinutes.length < 3) {
        setInputMinutes(prev => prev + num.toString());
      }
    }
  };

  const handleDelete = () => {
    setInputMinutes(prev => prev.slice(0, -1) || '00');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
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
          />

          <View style={styles.keypadContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <TouchableOpacity key={num} style={styles.keypadButton} onPress={() => handleNumberPress(num)}>
                <Text style={styles.keypadButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.keypadButtonPlaceholder} />
            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress(0)}>
              <Text style={styles.keypadButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadButton} onPress={handleDelete}>
              <FontAwesome5 name="backspace" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonContainer}>
            <Button title="취소" onPress={handleCancel} primary={false} style={styles.actionButton} />
            <Button title="확인" onPress={handleInputConfirm} style={styles.actionButton} />
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
