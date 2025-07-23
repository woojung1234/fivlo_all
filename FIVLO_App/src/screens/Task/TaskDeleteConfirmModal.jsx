// src/screens/TaskDeleteConfirmModal.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';
import CharacterImage from '../../components/common/CharacterImage';

const TaskDeleteConfirmModal = ({ task, onConfirm, onCancel }) => {
  const [deleteFutureTasks, setDeleteFutureTasks] = useState(false); // 미래 Task 삭제 여부

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true} // 항상 보이도록 설정 (부모에서 제어)
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <CharacterImage style={styles.obooniImage} />
          <Text style={styles.messageText}>
            {task.text} Task를 정말 삭제하시겠어요?
          </Text>

          {task.isDailyRepeat && ( // 매일 반복 Task인 경우에만 표시
            <View style={styles.checkboxContainer}>
              <TouchableOpacity onPress={() => setDeleteFutureTasks(!deleteFutureTasks)}>
                <FontAwesome5
                  name={deleteFutureTasks ? 'check-square' : 'square'}
                  size={24}
                  color={deleteFutureTasks ? Colors.accentApricot : Colors.secondaryBrown}
                />
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>미래 예정된 Task도 모두 삭제</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button title="예" onPress={() => onConfirm(deleteFutureTasks)} style={styles.actionButton} />
            <Button title="아니오" onPress={onCancel} primary={false} style={styles.actionButton} />
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default TaskDeleteConfirmModal;
