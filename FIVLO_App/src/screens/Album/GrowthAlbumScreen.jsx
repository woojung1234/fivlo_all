// src/screens/Album/GrowthAlbumScreen.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // useIsFocused 임포트 추가
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';

// PhotoUploadModal, GrowthAlbumCalendarView, GrowthAlbumCategoryView 임포트
import PhotoUploadModal from './PhotoUploadModal';
import GrowthAlbumCalendarView from './GrowthAlbumCalendarView';
import GrowthAlbumCategoryView from './GrowthAlbumCategoryView';

const GrowthAlbumScreen = ({ isPremiumUser }) => { // isPremiumUser prop 받기
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused(); // 화면 포커스 여부

  const [activeView, setActiveView] = useState('calendar'); // 'calendar' 또는 'category'
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  // 사진 업로드 모달에서 저장 완료 후 앨범 뷰 새로고침을 위한 상태
  const [refreshAlbumKey, setRefreshAlbumKey] = useState(0);

  // Task 완료 시 사진 촬영/갤러리 업로드 팝업 (임시 트리거)
  const handleTriggerPhotoUpload = () => {
    // 실제로는 TaskDetailModal에서 Task 완료 시 호출될 것
    setIsPhotoModalVisible(true);
  };

  // 사진 업로드 모달 닫기 및 앨범 새로고침
  const onPhotoUploadModalClose = () => {
    setIsPhotoModalVisible(false);
    setRefreshAlbumKey(prev => prev + 1); // 앨범 뷰 컴포넌트 강제 리렌더링 (데이터 새로고침)
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="성장 앨범" showBackButton={true} />

      <View style={styles.contentContainer}>
        {/* 탭바: 캘린더 형식 / 카테고리별 형식 */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.viewToggleButton, activeView === 'calendar' && styles.viewToggleButtonActive]}
            onPress={() => setActiveView('calendar')}
          >
            <Text style={[styles.viewButtonText, activeView === 'calendar' && styles.viewButtonTextActive]}>캘린더 형식</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleButton, activeView === 'category' && styles.viewToggleButtonActive]}
            onPress={() => setActiveView('category')}
          >
            <Text style={[styles.viewButtonText, activeView === 'category' && styles.viewButtonTextActive]}>카테고리별 형식</Text>
          </TouchableOpacity>
        </View>

        {/* 뷰에 따라 다른 컴포넌트 렌더링 */}
        {activeView === 'calendar' ? (
          <GrowthAlbumCalendarView key={`calendar-${refreshAlbumKey}`} isPremiumUser={isPremiumUser} />
        ) : (
          <GrowthAlbumCategoryView key={`category-${refreshAlbumKey}`} isPremiumUser={isPremiumUser} />
        )}

        {/* 테스트용 사진 업로드 트리거 버튼 (실제로는 Task 완료 시 호출) */}
        <TouchableOpacity style={styles.testPhotoButton} onPress={handleTriggerPhotoUpload}>
          <Text style={styles.testPhotoButtonText}>테스트: 사진 업로드 팝업 띄우기</Text>
        </TouchableOpacity>
      </View>

      {/* 사진 촬영/갤러리 업로드 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPhotoModalVisible}
        onRequestClose={onPhotoUploadModalClose}
      >
        <PhotoUploadModal onClose={onPhotoUploadModalClose} isPremiumUser={isPremiumUser} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    marginBottom: 20,
    width: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 15,
  },
  viewToggleButtonActive: {
    backgroundColor: Colors.accentApricot,
  },
  viewButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    fontWeight: FontWeights.medium,
  },
  viewButtonTextActive: {
    color: Colors.textLight,
    fontWeight: FontWeights.bold,
  },
  testPhotoButton: {
    backgroundColor: Colors.secondaryBrown,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  testPhotoButtonText: {
    color: Colors.textLight,
    fontSize: FontSizes.small,
  },
});

export default GrowthAlbumScreen;
