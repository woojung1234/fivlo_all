// src/screens/Reminder/ReminderLocationAlertModal.jsx

import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';

const ReminderLocationAlertModal = ({ isVisible, onClose, locationName }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <CharacterImage style={styles.obooniImage} />
          <Text style={styles.messageText}>
            헉! 설정된 장소({locationName || '장소'})를 벗어났어요{"\n"}잊으신 건 없나요?
          </Text>
          <Button title="확인" onPress={onClose} style={styles.confirmButton} />
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

export default ReminderLocationAlertModal;
