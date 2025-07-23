// src/screens/Task/CategoryEditModal.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';

// API 서비스 임포트
import { createCategory, updateCategory } from '../../services/taskApi'; // updateCategory는 예시, Postman 가이드에 없음

// 포모도로 목표 색상 팔레트 (CategoryEditModal에서도 재사용)
const COLOR_PALETTE = [
  '#FFD1DC', '#FFABAB', '#FFC3A0', '#FFDD99', '#FFFFB5', '#D1FFB5', '#A0FFC3', '#ABFFFF',
  '#D1B5FF', '#FFB5FF', '#C3A0FF', '#99DDFF', '#B5FFFF', '#B5FFD1', '#A0FFAB', '#C3FFAB',
  '#E0BBE4', '#957DAD', '#D291BC', '#FFC72C',
];

const CategoryEditModal = ({ mode, initialCategory, onSave, onClose, isPremiumUser }) => { // isPremiumUser prop 받기
  const [categoryName, setCategoryName] = useState(initialCategory ? initialCategory.name : '');
  const [selectedColor, setSelectedColor] = useState(initialCategory ? initialCategory.color : COLOR_PALETTE[0]);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('알림', '카테고리 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const categoryData = {
        name: categoryName,
        color: selectedColor,
        // description 필드는 명세에 있지만 현재 UI에 없으므로, 필요시 추가
      };
      let response;
      if (mode === 'add') {
        response = await createCategory(categoryData); // API 호출
        Alert.alert('카테고리 추가', `"${categoryName}" 카테고리가 추가되었습니다.`);
      } else {
        // Postman 가이드에 카테고리 수정 API는 없지만, 예시로 추가
        // response = await updateCategory(initialCategory.id, categoryData);
        Alert.alert('카테고리 수정', `"${categoryName}" 카테고리가 수정되었습니다.`);
        response = { id: initialCategory.id, ...categoryData }; // Mock 응답
      }
      onSave(response); // 부모 컴포넌트에 저장된 카테고리 전달
    } catch (error) {
      console.error(`카테고리 ${mode === 'add' ? '생성' : '수정'} 실패:`, error.response ? error.response.data : error.message);
      Alert.alert('오류', `카테고리 ${mode === 'add' ? '생성' : '수정'} 중 문제가 발생했습니다.`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderColorItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.colorOption, { backgroundColor: item }]}
      onPress={() => setSelectedColor(item)}
      disabled={isLoading}
    >
      {selectedColor === item && (
        <FontAwesome5 name="check" size={20} color={Colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        {isLoading && ( // 로딩 스피너 표시
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.accentApricot} />
          </View>
        )}
        <Text style={styles.modalTitle}>{mode === 'add' ? '카테고리 추가' : '카테고리 수정'}</Text>

        <Text style={styles.sectionTitle}>카테고리 내용 입력</Text>
        <TextInput
          style={styles.categoryInput}
          placeholder="예: 운동"
          placeholderTextColor={Colors.secondaryBrown}
          value={categoryName}
          onChangeText={setCategoryName}
          disabled={isLoading}
        />

        <Text style={styles.sectionTitle}>색상 선택</Text>
        <FlatList
          data={COLOR_PALETTE}
          renderItem={renderColorItem}
          keyExtractor={item => item}
          numColumns={5}
          contentContainerStyle={styles.colorOptionsGrid}
          scrollEnabled={false} // 모달 내 스크롤 방지
        />

        <View style={styles.buttonContainer}>
          <Button title="취소" onPress={onClose} primary={false} style={styles.actionButton} disabled={isLoading} />
          <Button title="저장" onPress={handleSave} style={styles.actionButton} disabled={isLoading} />
        </View>
      </View>
    </View>
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
    maxHeight: '80%',
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
  sectionTitle: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 10,
    width: '100%',
    textAlign: 'left',
    marginTop: 15,
  },
  categoryInput: {
    width: '100%',
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  colorOptionsGrid: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  colorOption: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    margin: 8,
    borderWidth: 2,
    borderColor: Colors.secondaryBrown,
    justifyContent: 'center',
    alignItems: 'center',
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

export default CategoryEditModal;
