// src/screens/Task/CategorySettingModal.jsx

import React, { useState, useEffect } from 'react'; // useEffect 임포트 추가
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation, useIsFocused } from '@react-navigation/native'; // useIsFocused 임포트 추가
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';

// CategoryEditModal 임포트
import CategoryEditModal from './CategoryEditModal';

// API 서비스 임포트
import { getCategories } from '../../services/taskApi';

const CategorySettingModal = ({ onSave, onClose, isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editMode, setEditMode] = useState('add');
  const [currentEditingCategory, setCurrentEditingCategory] = useState(null);

  const [categories, setCategories] = useState([]); // 백엔드에서 가져올 카테고리 목록
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 카테고리 목록 로드
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories(); // API 호출
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '카테고리 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 포커스 시 카테고리 다시 로드
  useEffect(() => {
    if (isFocused) {
      fetchCategories();
    }
  }, [isFocused]);

  const handleEditCategory = (category) => {
    setEditMode('edit');
    setCurrentEditingCategory(category);
    setIsEditModalVisible(true);
  };

  const handleAddCategory = () => {
    setEditMode('add');
    setCurrentEditingCategory(null);
    setIsEditModalVisible(true);
  };

  const onCategoryEditSave = (updatedCategory) => {
    // 카테고리 저장 후 목록 새로고침 (실제로는 백엔드에서 다시 불러오는 것이 가장 안정적)
    setIsEditModalVisible(false);
    fetchCategories(); // 카테고리 목록 새로고침
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <View style={[styles.categoryColorBox, { backgroundColor: item.color }]} />
      <Text style={styles.categoryName}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleEditCategory(item)} style={styles.editIcon}>
        <FontAwesome5 name="pen" size={18} color={Colors.secondaryBrown} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        {isLoading && ( // 로딩 스피너 표시
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.accentApricot} />
          </View>
        )}
        <Text style={styles.modalTitle}>카테고리 설정</Text>

        {categories.length > 0 ? (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoryListContent}
          />
        ) : (
          <Text style={styles.noCategoriesText}>등록된 카테고리가 없습니다.</Text>
        )}

        <Button title="새 카테고리 추가" onPress={handleAddCategory} style={styles.addButton} disabled={isLoading} />
        <Button title="닫기" onPress={onClose} primary={false} style={styles.closeButton} disabled={isLoading} />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <CategoryEditModal
          mode={editMode}
          initialCategory={currentEditingCategory}
          onSave={onCategoryEditSave}
          onClose={() => setIsEditModalVisible(false)}
          isPremiumUser={isPremiumUser} // isPremiumUser 전달
        />
      </Modal>
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
  categoryListContent: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryColorBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  categoryName: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    flex: 1,
  },
  editIcon: {
    padding: 5,
  },
  noCategoriesText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
    marginTop: 30,
  },
  addButton: {
    marginTop: 20,
    width: '100%',
  },
  closeButton: {
    marginTop: 10,
    width: '100%',
  },
});

export default CategorySettingModal;
