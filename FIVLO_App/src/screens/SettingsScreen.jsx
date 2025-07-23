// src/screens/SettingsScreen.jsx

import React, { useState } from 'react'; // useState 임포트 추가
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native'; // ScrollView 임포트 추가
import Header from '../components/common/Header';
import { GlobalStyles } from '../styles/GlobalStyles';
import { Colors } from '../styles/color';
import { FontSizes, FontWeights } from '../styles/Fonts';
import { useNavigation } from '@react-navigation/native'; // useNavigation 임포트 추가
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // useSafeAreaInsets 임포트 추가
import { FontAwesome5 } from '@expo/vector-icons'; // FontAwesome5 임포트 추가

const SettingsScreen = ({ isPremiumUser: initialIsPremiumUser }) => { // isPremiumUser props로 받기
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // 현재는 props로 받지만, 실제 앱에서는 전역 상태나 백엔드에서 유료 사용자 여부를 가져옵니다.
  const [isPremiumUser, setIsPremiumUser] = useState(initialIsPremiumUser || false); 

  const settingsOptions = [
    { id: '1', name: '알림 설정', screen: 'Reminder' }, // 예시: 알림 설정 페이지로
    { id: '2', name: '계정 관리', screen: 'AccountManagement' }, // 예시: 계정 관리 페이지로
    { id: '3', name: '오분이 커스터마이징', screen: 'ObooniCustomization' }, // 오분이 커스터마이징 페이지로
    { id: '4', name: '이용 약관', screen: 'TermsOfService' }, // 예시: 이용 약관 페이지로
    { id: '5', name: '개인정보 처리방침', screen: 'PrivacyPolicy' }, // 예시: 개인정보 처리방침 페이지로
    { id: '6', name: '버전 정보', screen: 'VersionInfo' }, // 예시: 버전 정보 표시
  ];

  const handleOptionPress = (option) => {
    if (option.screen === 'ObooniCustomization') {
      // ObooniCustomizationScreen은 모달로 띄우므로, isPremiumUser 정보를 함께 전달
      navigation.navigate('ObooniCustomization', { isPremiumUser: isPremiumUser });
    } else if (option.screen) {
      Alert.alert('이동', `${option.name} 페이지로 이동합니다.`);
      // navigation.navigate(option.screen); // 실제 페이지로 이동
    } else {
      Alert.alert('알림', `${option.name} 기능은 아직 구현되지 않았습니다.`);
    }
  };

  const renderSettingItem = ({ item }) => (
    <TouchableOpacity style={styles.settingItem} onPress={() => handleOptionPress(item)}>
      <Text style={styles.settingItemText}>{item.name}</Text>
      <FontAwesome5 name="chevron-right" size={18} color={Colors.secondaryBrown} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 20 }]}>
      <Header title="설정" showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <FlatList
          data={settingsOptions}
          renderItem={renderSettingItem}
          keyExtractor={item => item.id}
          scrollEnabled={false} // 부모 ScrollView가 스크롤 담당
          contentContainerStyle={styles.settingsListContent}
        />
      </ScrollView>
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
    paddingTop: 10,
  },
  settingsListContent: {
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryBeige,
  },
  settingItemText: {
    fontSize: FontSizes.medium,
    color: Colors.textDark,
  },
});

export default SettingsScreen;
