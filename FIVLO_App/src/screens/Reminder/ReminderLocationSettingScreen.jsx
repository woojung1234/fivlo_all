// src/screens/Reminder/ReminderLocationSettingScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
// import MapView from 'react-native-maps'; // 지도 기능을 위해 필요: npm install react-native-maps

// 공통 스타일 및 컴포넌트 임포트
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Colors } from '../../styles/color';
import { FontSizes, FontWeights } from '../../styles/Fonts';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

const ReminderLocationSettingScreen = ({ isPremiumUser }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { initialLocation, initialLocationCoords, onLocationSelected } = route.params;

  const [locationName, setLocationName] = useState(initialLocation || '');
  const [addressInput, setAddressInput] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: initialLocationCoords?.latitude || 35.8200,
    longitude: initialLocationCoords?.longitude || 127.1500,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveLocation = () => {
    if (!locationName.trim() && !addressInput.trim()) {
      Alert.alert('알림', '장소 이름 또는 주소를 입력해주세요.');
      return;
    }
    
    const finalLocationName = locationName.trim() || addressInput.trim();
    const finalLocationCoords = {
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude,
    };

    if (onLocationSelected) {
      onLocationSelected(finalLocationName, finalLocationCoords);
    }
    Alert.alert('장소 저장', `"${finalLocationName}" 장소가 저장되었습니다.`);
    navigation.goBack();
  };

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="장소 설정" showBackButton={true} />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentApricot} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <Text style={styles.sectionTitle}>장소 이름을 입력해주세요</Text>
        <TextInput
          style={styles.inputField}
          placeholder="예: 집, 회사, 학교"
          placeholderTextColor={Colors.secondaryBrown}
          value={locationName}
          onChangeText={setLocationName}
          editable={!isLoading}
        />

        <Text style={styles.sectionTitle}>Q 장소를 입력해주세요</Text>
        <TextInput
          style={styles.inputField}
          placeholder="주소를 입력하세요"
          placeholderTextColor={Colors.secondaryBrown}
          value={addressInput}
          onChangeText={setAddressInput}
          editable={!isLoading}
        />

        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>지도 표시 영역</Text>
          <Text style={styles.mapPlaceholderText}>(react-native-maps 설치 및 설정 필요)</Text>
          <Text style={styles.mapRadiusText}>반경 100m</Text>
        </View>

        <Button title="저장하기" onPress={handleSaveLocation} style={styles.saveButton} disabled={isLoading} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBeige,
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
    borderRadius: 15,
    zIndex: 10,
  },
  scrollViewContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: 'center',
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
  inputField: {
    width: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    padding: 15,
    fontSize: FontSizes.medium,
    color: Colors.textDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.textLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.secondaryBrown,
    position: 'relative',
  },
  mapPlaceholderText: {
    fontSize: FontSizes.medium,
    color: Colors.secondaryBrown,
    textAlign: 'center',
  },
  mapRadiusText: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: FontSizes.small,
    color: Colors.secondaryBrown,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    width: '100%',
  },
});

export default ReminderLocationSettingScreen;
