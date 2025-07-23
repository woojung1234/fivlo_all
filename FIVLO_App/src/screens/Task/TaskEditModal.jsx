// src/screens/Task/TaskEditModal.jsx

import React, { useState, useEffect } from 'react'; // useEffect 임포트 추가
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';

// CategorySettingModal 임포트
import CategorySettingModal from './CategorySettingModal';

// API 서비스 임포트
import { getCategories } from '../../services/taskApi';

const TaskEditModal = ({ mode, initialTask, onSave, onClose, isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const [taskContent, setTaskContent] = useState(initialTask ? initialTask.title : ''); // 'text' 대신 'title' 사용
  const [selectedCategory, setSelectedCategory] = useState(initialTask?.category?.name || '일상'); // 카테고리 이름
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialTask?.category?.id || null); // 카테고리 ID
  const [selectedCategoryColor, setSelectedCategoryColor] = useState(initialTask?.category?.color || Colors.primaryBeige);
  const [isDailyRepeat, setIsDailyRepeat] = useState(initialTask ? initialTask.isRepeating : false); // 'isRepeating' 사용
  const [isAlbumLinked, setIsAlbumLinked] = useState(initialTask ? initialTask.hasGrowthAlbum : false); // 'hasGrowthAlbum' 사용

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [categories, setCategories] = useState([]); // 백엔드에서 가져올 카테고리 목록
  const [isLoadingCategories, setIsLoadingCategories] = useState(false); // 카테고리 로딩 상태

  // 카테고리 목록 로드
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await getCategories(); // API 호출
        setCategories(data);
        // 초기 Task가 있다면 해당 카테고리 ID 설정
        if (initialTask && initialTask.category) {
          setSelectedCategoryId(initialTask.category.id);
        } else if (data.length > 0) {
          // 기본 '일상' 카테고리 찾기 또는 첫 번째 카테고리 선택
          const defaultCategory = data.find(cat => cat.name === '일상') || data[0];
          setSelectedCategory(defaultCategory.name);
          setSelectedCategoryId(defaultCategory.id);
          setSelectedCategoryColor(defaultCategory.color);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error.response ? error.response.data : error.message);
        Alert.alert('오류', '카테고리 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category) => { // 카테고리 객체 전체를 받음
    setSelectedCategory(category.name);
    setSelectedCategoryId(category.id);
    setSelectedCategoryColor(category.color);
  };

  // 카테고리 설정 모달에서 저장 완료 시
  const onCategorySave = (newCategory) => { // 새로 생성/수정된 카테고리 객체
    // categories 목록 업데이트 (실제로는 백엔드에서 다시 불러오는 것이 더 안정적)
    setCategories(prev => {
      const existingIndex = prev.findIndex(cat => cat.id === newCategory.id);
      if (existingIndex > -1) {
        return prev.map(cat => cat.id === newCategory.id ? newCategory : cat);
      }
      return [...prev, newCategory];
    });
    setIsCategoryModalVisible(false);
    setSelectedCategory(newCategory.name);
    setSelectedCategoryId(newCategory.id);
    setSelectedCategoryColor(newCategory.color);
  };

  const handleSave = () => {
    if (!taskContent.trim()) {
      Alert.alert('알림', '할 일 내용을 입력해주세요.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }

    const savedTask = {
      id: initialTask ? initialTask.id : undefined, // 수정 모드일 때만 id 포함
      title: taskContent, // 'text' 대신 'title' 사용
      category: selectedCategoryId, // 카테고리 ID 전달
      date: initialTask ? initialTask.date : undefined, // Task 생성 시 날짜는 TaskDetailModal에서 전달
      isRepeating: isDailyRepeat,
      hasGrowthAlbum: isAlbumLinked,
      // completed 상태는 Task 생성 시 백엔드에서 기본값으로 설정될 것
      // description 필드는 명세에 있지만 현재 UI에 없으므로, 필요시 추가
    };
    onSave(savedTask); // 부모 컴포넌트에 저장할 Task 데이터 전달
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        {isLoadingCategories && ( // 카테고리 로딩 스피너
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.accentApricot} />
          </View>
        )}
        <Text style={styles.modalTitle}>{mode === 'add' ? '할 일 추가' : '할 일 수정'}</Text>

        {/* 내용 입력 칸 */}
        <TextInput
          style={styles.contentInput}
          placeholder="할 일 내용을 입력하세요"
          placeholderTextColor={Colors.secondaryBrown}
          value={taskContent}
          onChangeText={setTaskContent}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Task 카테고리 설정란 */}
        <Text style={styles.sectionTitle}>카테고리 설정</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContainer}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={cat.id} // key는 id 사용
              style={[
                styles.categoryButton,
                { backgroundColor: cat.color },
                selectedCategoryId === cat.id && styles.categoryButtonActive
              ]}
              onPress={() => handleCategorySelect(cat)} // 카테고리 객체 전체 전달
            >
              <Text style={styles.categoryButtonText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addCategoryButton} onPress={() => setIsCategoryModalVisible(true)}>
            <FontAwesome5 name="plus" size={20} color={Colors.secondaryBrown} />
          </TouchableOpacity>
        </ScrollView>

        {/* 매일 반복 여부 */}
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsDailyRepeat(!isDailyRepeat)}>
          <FontAwesome5
            name={isDailyRepeat ? 'check-square' : 'square'}
            size={24}
            color={isDailyRepeat ? Colors.accentApricot : Colors.secondaryBrown}
          />
          <Text style={styles.checkboxLabel}>매일 반복</Text>
        </TouchableOpacity>

        {/* 성장앨범 연동 여부 */}
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsAlbumLinked(!isAlbumLinked)}>
          <FontAwesome5
            name={isAlbumLinked ? 'check-square' : 'square'}
            size={24}
            color={isAlbumLinked ? Colors.accentApricot : Colors.secondaryBrown}
          />
          <Text style={styles.checkboxLabel}>성장앨범 연동 (Task 완료 시 사진 촬영)</Text>
        </TouchableOpacity>

        {/* 버튼들 */}
        <View style={styles.buttonContainer}>
          <Button title="취소" onPress={onClose} primary={false} style={styles.actionButton} />
          <Button title={mode === 'add' ? 'Task 입력' : 'Task 수정'} onPress={handleSave} style={styles.actionButton} />
        </View>
      </View>

      {/* 카테고리 설정 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCategoryModalVisible}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <CategorySettingModal
          onSave={onCategorySave}
          onClose={() => setIsCategoryModalVisible(false)}
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
    maxHeight: '85%',
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
  contentInput: {
    width: '100%',
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  sectionTitle: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 10,
    width: '100%',
    textAlign: 'left',
  },
  categoryScrollContainer: {
    paddingVertical: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryButton: {
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: Colors.accentApricot,
    borderWidth: 2,
  },
  categoryButtonText: {
    fontSize: FontSizes.small,
    color: Colors.textLight,
    fontWeight: FontWeights.medium,
  },
  addCategoryButton: {
    backgroundColor: Colors.primaryBeige,
    borderRadius: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
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
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default TaskEditModal;
