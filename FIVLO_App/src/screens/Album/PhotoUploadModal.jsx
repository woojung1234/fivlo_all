// src/screens/Album/PhotoUploadModal.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, Image, ScrollView, ActivityIndicator } from 'react-native'; // ActivityIndicator 임포트 추가
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

// 공통 스타일 및 컴포넌트 임포트
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Button from '../../components/common/Button';

// API 서비스 임포트
import { uploadGrowthAlbumPhoto } from '../../services/taskApi'; // taskApi 임포트

// expo-image-picker, expo-media-library 설치 필요: expo install expo-image-picker expo-media-library

const PhotoUploadModal = ({ onClose, isPremiumUser, taskId }) => { // isPremiumUser, taskId prop 받기
  const [memo, setMemo] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 카메라 권한 요청 및 사진 촬영
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 갤러리 권한 요청 및 사진 선택
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSavePhoto = async () => {
    if (!imageUri) {
      Alert.alert('알림', '사진을 촬영하거나 선택해주세요.');
      return;
    }
    if (!taskId) { // Task ID가 없으면 저장 불가 (성장 앨범은 Task와 연동)
      Alert.alert('오류', 'Task ID가 없어 사진을 저장할 수 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      // 이미지 파일 준비 (multipart/form-data를 위해)
      const photoFile = {
        uri: imageUri,
        name: `growth_album_${taskId}_${Date.now()}.jpg`, // 고유한 파일 이름
        type: 'image/jpeg',
      };

      const response = await uploadGrowthAlbumPhoto(taskId, photoFile, memo); // API 호출
      console.log("사진 업로드 성공:", response);
      Alert.alert('사진 저장', `사진과 메모("${memo}")가 저장되었습니다.`);
      onClose();
    } catch (error) {
      console.error("사진 업로드 실패:", error.response ? error.response.data : error.message);
      Alert.alert('오류', '사진 업로드 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {isLoading && ( // 로딩 스피너 표시
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.accentApricot} />
            </View>
          )}
          <Text style={styles.modalTitle}>사진 촬영 또는 업로드</Text>

          <View style={styles.photoPreviewContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.placeholderText}>사진 미리보기</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.photoActionButton} onPress={takePhoto} disabled={isLoading}>
              <FontAwesome5 name="camera" size={24} color={Colors.secondaryBrown} />
              <Text style={styles.photoActionButtonText}>사진 촬영</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoActionButton} onPress={pickImage} disabled={isLoading}>
              <FontAwesome5 name="images" size={24} color={Colors.secondaryBrown} />
              <Text style={styles.photoActionButtonText}>갤러리에서 업로드</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.memoInput}
            placeholder="메모를 작성하세요"
            placeholderTextColor={Colors.secondaryBrown}
            value={memo}
            onChangeText={setMemo}
            multiline={true}
            numberOfLines={2}
            textAlignVertical="top"
            editable={!isLoading}
          />

          <View style={styles.actionButtonContainer}>
            <Button title="취소" onPress={onClose} primary={false} style={styles.actionButton} disabled={isLoading} />
            <Button title="저장" onPress={handleSavePhoto} style={styles.actionButton} disabled={isLoading || !imageUri} />
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
    maxHeight: '90%',
    alignItems: 'center',
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
  photoPreviewContainer: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  photoActionButton: {
    backgroundColor: Colors.primaryBeige,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photoActionButtonText: {
    fontSize: FontSizes.small,
    color: Colors.textDark,
    marginTop: 5,
    textAlign: 'center',
  },
  memoInput: {
    width: '100%',
    backgroundColor: Colors.primaryBeige,
    borderRadius: 10,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default PhotoUploadModal;
