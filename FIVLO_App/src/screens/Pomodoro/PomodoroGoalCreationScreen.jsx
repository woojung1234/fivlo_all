// src/screens/Pomodoro/PomodoroGoalCreationScreen.jsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

// API 서비스 임포트
import { createPomodoroSession } from '../../services/pomodoroApi'; // API 임포트

// 포모도로 목표 색상 팔레트
const COLOR_PALETTE = [
  '#FFD1DC', '#FFABAB', '#FFC3A0', '#FFDD99', '#FFFFB5', '#D1FFB5', '#A0FFC3', '#ABFFFF',
  '#D1B5FF', '#FFB5FF', '#C3A0FF', '#99DDFF', '#B5FFFF', '#B5FFD1', '#A0FFAB', '#C3FFAB',
  '#E0BBE4', '#957DAD', '#D291BC', '#FFC72C',
];

const PomodoroGoalCreationScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [goalText, setGoalText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // "저장" 버튼 클릭 핸들러 (API 연동)
  const handleSaveGoal = async () => {
    if (!goalText.trim()) {
      Alert.alert('알림', '집중 목표를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createPomodoroSession(goalText, selectedColor); // API 호출
      console.log('포모도로 세션 생성 성공:', response);
      Alert.alert('목표 저장', `"${goalText}" 목표가 저장되었습니다.`);
      // 생성된 목표 정보를 다음 화면으로 전달
      navigation.navigate('PomodoroGoalSelection', {
        newGoal: {
          id: response.id, // 백엔드에서 받은 ID 사용
          text: response.title, // 백엔드에서 받은 title 사용
          color: response.color
        }
      });
    } catch (error) {
      console.error('포모도로 세션 생성 실패:', error.response ? error.response.data : error.message);
      Alert.alert('오류', error.response?.data?.message || '목표 저장 중 문제가 발생했습니다.');
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
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="집중 목표 작성" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        {isLoading && ( // 로딩 스피너 오버레이
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.accentApricot} />
          </View>
        )}
        <Text style={styles.sectionTitle}>목표를 작성하는 칸</Text>
        <TextInput
          style={styles.goalInput}
          placeholder="예: 토익 공부하기"
          placeholderTextColor={Colors.secondaryBrown}
          value={goalText}
          onChangeText={setGoalText}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
          editable={!isLoading}
        />

        <Text style={styles.sectionTitle}>색상을 설정하는 칸</Text>
        <TouchableOpacity style={styles.colorDisplayButton} onPress={() => setShowColorPicker(true)} disabled={isLoading}>
          <View style={[styles.selectedColorPreview, { backgroundColor: selectedColor }]} />
          <Text style={styles.colorButtonText}>색상 선택</Text>
        </TouchableOpacity>

        <Button title="저장" onPress={handleSaveGoal} style={styles.saveButton} disabled={isLoading} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showColorPicker}
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.colorPickerOverlay}>
          <View style={styles.colorPickerContent}>
            <Text style={styles.colorPickerTitle}>색상 설정</Text>
            <FlatList
              data={COLOR_PALETTE}
              renderItem={renderColorItem}
              keyExtractor={item => item}
              numColumns={5}
              contentContainerStyle={styles.colorOptionsGrid}
              scrollEnabled={false}
            />
            <Button title="완료" onPress={() => setShowColorPicker(false)} style={styles.colorPickerDoneButton} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    paddingTop: 10,
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
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginTop: 25,
    marginBottom: 10,
    width: '100%',
    textAlign: 'left',
  },
  goalInput: {
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    minHeight: 100,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  colorDisplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedColorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
  },
  colorButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
  saveButton: {
    marginTop: 40,
    width: '100%',
  },
  colorPickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  colorPickerContent: {
    backgroundColor: Colors.textLight,
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '70%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  colorPickerTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    marginBottom: 20,
  },
  colorOptionsGrid: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
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
  colorPickerDoneButton: {
    marginTop: 20,
    width: '80%',
  },
});

export default PomodoroGoalCreationScreen;
